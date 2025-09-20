using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using ShirpurDeliveryAPI.Data;
using ShirpurDeliveryAPI.Models;
using ShirpurDeliveryAPI.Hubs;

namespace ShirpurDeliveryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly DeliveryContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public OrdersController(DeliveryContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            return await _context.Orders
                .Include(o => o.Items)
                .Include(o => o.DeliveryTracking)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .Include(o => o.DeliveryTracking)
                .FirstOrDefaultAsync(o => o.Id == id);
            return order == null ? NotFound() : order;
        }

        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder(Order order)
        {
            order.OrderId = Guid.NewGuid().ToString()[..8];
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            
            // Admin notification: New order received
            await _hubContext.Clients.Group("admin").SendAsync("AdminNotification", new {
                type = "new_order",
                title = "New Order Received",
                message = $"Order #{order.OrderId} from {order.CustomerName} - ₹{order.Total}",
                orderId = order.OrderId,
                priority = "high"
            });
            
            // Delivery notification: New delivery available
            await _hubContext.Clients.Group("delivery").SendAsync("DeliveryNotification", new {
                type = "new_delivery",
                title = "New Delivery Available",
                message = $"Order #{order.OrderId} ready for pickup - ₹{order.Total}",
                orderId = order.OrderId,
                customerAddress = order.DeliveryAddress,
                priority = "medium"
            });
            
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string status)
        {
            var order = await _context.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();
            
            var oldStatus = order.Status;
            order.Status = status;
            await _context.SaveChangesAsync();
            
            // Admin notification: Order status changed
            await _hubContext.Clients.Group("admin").SendAsync("AdminNotification", new {
                type = "status_update",
                title = "Order Status Updated",
                message = $"Order #{order.OrderId} changed from {oldStatus} to {status}",
                orderId = order.OrderId,
                priority = "medium"
            });
            
            // Customer notification: Your order status
            await _hubContext.Clients.Group($"customer_{order.CustomerPhone}").SendAsync("CustomerNotification", new {
                type = "order_update",
                title = GetCustomerStatusTitle(status),
                message = GetCustomerStatusMessage(order.OrderId, status),
                orderId = order.OrderId,
                status = status,
                priority = status == "out_for_delivery" ? "high" : "medium"
            });
            
            // Delivery notification: Order status for assigned orders
            if (status == "confirmed")
            {
                await _hubContext.Clients.Group("delivery").SendAsync("DeliveryNotification", new {
                    type = "order_ready",
                    title = "Order Ready for Pickup",
                    message = $"Order #{order.OrderId} confirmed and ready for delivery",
                    orderId = order.OrderId,
                    priority = "high"
                });
            }
            
            return NoContent();
        }
        
        private string GetCustomerStatusTitle(string status) => status switch
        {
            "confirmed" => "Order Confirmed",
            "out_for_delivery" => "Out for Delivery",
            "delivered" => "Order Delivered",
            _ => "Order Update"
        };
        
        private string GetCustomerStatusMessage(string orderId, string status) => status switch
        {
            "confirmed" => $"Your order #{orderId} has been confirmed and is being prepared",
            "out_for_delivery" => $"Your order #{orderId} is on the way! Delivery partner will contact you soon",
            "delivered" => $"Your order #{orderId} has been delivered successfully. Thank you!",
            _ => $"Your order #{orderId} status: {status}"
        };

        [HttpPut("{id}/location")]
        public async Task<IActionResult> UpdateDeliveryLocation(int id, [FromBody] LocationUpdate location)
        {
            var tracking = await _context.DeliveryTrackings.FirstOrDefaultAsync(t => t.OrderId == id);
            if (tracking == null)
            {
                tracking = new DeliveryTracking { OrderId = id };
                _context.DeliveryTrackings.Add(tracking);
            }
            tracking.CurrentLatitude = location.Latitude;
            tracking.CurrentLongitude = location.Longitude;
            tracking.LastLocationUpdate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class LocationUpdate
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
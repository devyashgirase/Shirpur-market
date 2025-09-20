using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ShirpurDeliveryAPI.Data;
using ShirpurDeliveryAPI.Hubs;

namespace ShirpurDeliveryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly DeliveryContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationsController(DeliveryContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpPost("admin/low-stock")]
        public async Task<IActionResult> SendLowStockAlert()
        {
            var lowStockProducts = await _context.Products
                .Where(p => p.IsActive && p.StockQuantity < 10)
                .ToListAsync();

            if (lowStockProducts.Any())
            {
                await _hubContext.Clients.Group("admin").SendAsync("AdminNotification", new
                {
                    type = "low_stock",
                    title = "Low Stock Alert",
                    message = $"{lowStockProducts.Count} products are running low on stock",
                    priority = "high"
                });
            }

            return Ok(new { alertsSent = lowStockProducts.Count });
        }

        [HttpPost("delivery/route-update")]
        public async Task<IActionResult> SendRouteUpdate([FromBody] RouteUpdateRequest request)
        {
            await _hubContext.Clients.Group("delivery").SendAsync("DeliveryNotification", new
            {
                type = "route_update",
                title = "Route Optimized",
                message = $"New route calculated for {request.OrderCount} deliveries - {request.EstimatedTime} mins",
                priority = "medium"
            });

            return Ok();
        }

        [HttpPost("customer/delivery-eta")]
        public async Task<IActionResult> SendDeliveryETA([FromBody] DeliveryETARequest request)
        {
            await _hubContext.Clients.Group($"customer_{request.CustomerPhone}").SendAsync("CustomerNotification", new
            {
                type = "delivery_eta",
                title = "Delivery Update",
                message = $"Your order #{request.OrderId} will arrive in approximately {request.ETA} minutes",
                orderId = request.OrderId,
                priority = "medium"
            });

            return Ok();
        }
    }

    public class RouteUpdateRequest
    {
        public int OrderCount { get; set; }
        public int EstimatedTime { get; set; }
    }

    public class DeliveryETARequest
    {
        public string OrderId { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public int ETA { get; set; }
    }
}
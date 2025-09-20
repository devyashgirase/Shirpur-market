using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShirpurDeliveryAPI.Data;

namespace ShirpurDeliveryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DatabaseController : ControllerBase
    {
        private readonly DeliveryContext _context;

        public DatabaseController(DeliveryContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<ActionResult> GetDatabaseStats()
        {
            var stats = new
            {
                ProductsCount = await _context.Products.CountAsync(),
                OrdersCount = await _context.Orders.CountAsync(),
                OrderItemsCount = await _context.OrderItems.CountAsync(),
                DeliveryTrackingsCount = await _context.DeliveryTrackings.CountAsync(),
                TotalRevenue = await _context.Orders
                    .Where(o => o.PaymentStatus == "paid")
                    .SumAsync(o => o.Total),
                LastOrder = await _context.Orders
                    .OrderByDescending(o => o.CreatedAt)
                    .Select(o => new { o.OrderId, o.CustomerName, o.CreatedAt })
                    .FirstOrDefaultAsync()
            };
            return Ok(stats);
        }

        [HttpGet("tables")]
        public ActionResult GetTableStructure()
        {
            var tables = new
            {
                Products = new
                {
                    Columns = new[] { "Id", "Name", "Description", "Price", "ImageUrl", "Category", "StockQuantity", "IsActive", "CreatedAt" },
                    SampleQuery = "SELECT * FROM Products WHERE IsActive = 1"
                },
                Orders = new
                {
                    Columns = new[] { "Id", "OrderId", "CustomerName", "CustomerPhone", "DeliveryAddress", "Total", "Status", "PaymentStatus", "CreatedAt" },
                    SampleQuery = "SELECT * FROM Orders ORDER BY CreatedAt DESC"
                },
                OrderItems = new
                {
                    Columns = new[] { "Id", "OrderId", "ProductId", "ProductName", "Price", "Quantity" },
                    SampleQuery = "SELECT oi.*, p.Name FROM OrderItems oi JOIN Products p ON oi.ProductId = p.Id"
                },
                DeliveryTrackings = new
                {
                    Columns = new[] { "Id", "OrderId", "DeliveryAgentName", "DeliveryAgentPhone", "CurrentLatitude", "CurrentLongitude", "LastLocationUpdate" },
                    SampleQuery = "SELECT * FROM DeliveryTrackings WHERE CurrentLatitude IS NOT NULL"
                }
            };
            return Ok(tables);
        }
    }
}
using Microsoft.AspNetCore.SignalR;

namespace ShirpurDeliveryAPI.Hubs
{
    public class NotificationHub : Hub
    {
        public async Task JoinGroup(string userType, string? userId = null)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userType);
            
            // For customers, also join customer-specific group
            if (userType == "customer" && !string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"customer_{userId}");
            }
        }
        
        public async Task LeaveGroup(string userType, string? userId = null)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userType);
            
            if (userType == "customer" && !string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"customer_{userId}");
            }
        }
    }
}
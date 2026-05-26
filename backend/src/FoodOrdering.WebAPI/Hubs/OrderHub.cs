using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace FoodOrdering.WebAPI.Hubs
{
    [Authorize]
    public class OrderHub : Hub
    {
        public async Task JoinOrderGroup(string orderId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Order_{orderId}");
        }

        public async Task LeaveOrderGroup(string orderId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Order_{orderId}");
        }

        public async Task JoinAdminDashboard()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "AdminGroup");
        }

        public async Task LeaveAdminDashboard()
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "AdminGroup");
        }
    }
}

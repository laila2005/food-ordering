using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using FoodOrdering.Application.DTOs.Orders;
using FoodOrdering.Domain.Entities;
using FoodOrdering.Domain.Enums;
using FoodOrdering.Infrastructure.Data;
using FoodOrdering.WebAPI.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

namespace FoodOrdering.WebAPI.Controllers
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<OrderHub> _hubContext;

        public OrdersController(ApplicationDbContext context, IHubContext<OrderHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
            {
                return Unauthorized(new { Message = "Your session has expired or your user account no longer exists. Please log out and log back in." });
            }

            if (dto.Items == null || !dto.Items.Any())
            {
                return BadRequest(new { Message = "Cart must contain at least one item." });
            }

            var productIds = dto.Items.Select(i => i.ProductId).ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id) && p.IsAvailable)
                .ToListAsync();

            if (products.Count != productIds.Distinct().Count())
            {
                return BadRequest(new { Message = "Some items in the cart are no longer available." });
            }

            var order = new Order
            {
                UserId = userId,
                DeliveryAddress = dto.DeliveryAddress,
                PhoneNumber = dto.PhoneNumber,
                AddressDetails = dto.AddressDetails,
                Notes = dto.Notes,
                PaymentMethod = dto.PaymentMethod,
                Status = OrderStatus.Pending,
                PaymentStatus = dto.PaymentMethod == "Stripe" ? "Paid" : "Pending", // Mock Stripe payments as automatically succeeded
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            decimal total = 0;
            foreach (var itemDto in dto.Items)
            {
                var prod = products.First(p => p.Id == itemDto.ProductId);
                var orderItem = new OrderItem
                {
                    ProductId = prod.Id,
                    Quantity = itemDto.Quantity,
                    UnitPrice = prod.Price
                };
                order.OrderItems.Add(orderItem);
                total += prod.Price * itemDto.Quantity;
            }

            order.TotalAmount = total;
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Real-Time Notification: Broadcast the incoming order to admins
            var user = await _context.Users.FindAsync(userId);
            await _hubContext.Clients.Group("AdminGroup").SendAsync("ReceiveAdminOrderNotification", new
            {
                OrderId = order.Id,
                CustomerName = user?.FullName ?? "Customer",
                TotalAmount = order.TotalAmount,
                Status = order.Status.ToString(),
                CreatedAt = order.CreatedAt,
                PhoneNumber = order.PhoneNumber,
                AddressDetails = order.AddressDetails,
                Notes = order.Notes,
                DeliveryAddress = order.DeliveryAddress,
                PaymentMethod = order.PaymentMethod
            });

            return Ok(new { OrderId = order.Id, TotalAmount = order.TotalAmount, Status = order.Status.ToString() });
        }

        [HttpGet("my-orders")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
            {
                return Unauthorized(new { Message = "User account not found. Please log out and log back in." });
            }

            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            var result = orders.Select(o => new OrderDto
            {
                Id = o.Id,
                UserId = o.UserId,
                Status = o.Status.ToString(),
                PaymentMethod = o.PaymentMethod,
                PaymentStatus = o.PaymentStatus,
                TotalAmount = o.TotalAmount,
                DeliveryAddress = o.DeliveryAddress,
                PhoneNumber = o.PhoneNumber,
                AddressDetails = o.AddressDetails,
                Notes = o.Notes,
                CreatedAt = o.CreatedAt,
                Items = o.OrderItems.Select(oi => new OrderItemResponseDto
                {
                    ProductId = oi.ProductId,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    ProductName = oi.Product != null ? JsonSerializer.Deserialize<Dictionary<string, string>>(oi.Product.Name) ?? new() : new()
                }).ToList()
            });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(Guid id)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
            {
                return Unauthorized(new { Message = "User account not found. Please log out and log back in." });
            }

            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            // Secure endpoint: only order owner or admins can fetch it
            if (order.UserId != userId && userRole != Role.Admin.ToString())
            {
                return Forbid();
            }

            var dto = new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                CustomerName = order.User?.FullName ?? "Customer",
                Status = order.Status.ToString(),
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,
                TotalAmount = order.TotalAmount,
                DeliveryAddress = order.DeliveryAddress,
                PhoneNumber = order.PhoneNumber,
                AddressDetails = order.AddressDetails,
                Notes = order.Notes,
                CreatedAt = order.CreatedAt,
                Items = order.OrderItems.Select(oi => new OrderItemResponseDto
                {
                    ProductId = oi.ProductId,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    ProductName = oi.Product != null ? JsonSerializer.Deserialize<Dictionary<string, string>>(oi.Product.Name) ?? new() : new()
                }).ToList()
            };

            return Ok(dto);
        }
    }
}

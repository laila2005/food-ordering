using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using FoodOrdering.Application.DTOs.Menu;
using FoodOrdering.Application.DTOs.Orders;
using FoodOrdering.Domain.Entities;
using FoodOrdering.Domain.Enums;
using FoodOrdering.Infrastructure.Data;
using FoodOrdering.WebAPI.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace FoodOrdering.WebAPI.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<OrderHub> _hubContext;

        public AdminController(ApplicationDbContext context, IHubContext<OrderHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet("orders")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            var result = orders.Select(o => new OrderDto
            {
                Id = o.Id,
                UserId = o.UserId,
                CustomerName = o.User?.FullName ?? "Customer",
                Status = o.Status.ToString(),
                PaymentMethod = o.PaymentMethod,
                PaymentStatus = o.PaymentStatus,
                TotalAmount = o.TotalAmount,
                DeliveryAddress = o.DeliveryAddress,
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

        [HttpPut("orders/{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusDto dto)
        {
            if (!Enum.TryParse<OrderStatus>(dto.Status, true, out var parsedStatus))
            {
                return BadRequest(new { Message = $"Invalid status. Allowed values: {string.Join(", ", Enum.GetNames(typeof(OrderStatus)))}" });
            }

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id);
            if (order == null)
            {
                return NotFound();
            }

            order.Status = parsedStatus;
            order.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Real-Time Update: Dispatch status updates to order tracking group
            await _hubContext.Clients.Group($"Order_{id}").SendAsync("ReceiveStatusUpdate", new
            {
                OrderId = id,
                Status = order.Status.ToString(),
                UpdatedAt = order.UpdatedAt
            });

            // Real-Time Update: Dispatch general event update to dashboard group
            await _hubContext.Clients.Group("AdminGroup").SendAsync("ReceiveAdminStatusUpdate", new
            {
                OrderId = id,
                Status = order.Status.ToString()
            });

            return Ok(new { OrderId = id, Status = order.Status.ToString() });
        }

        [HttpPost("products")]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
        {
            var product = new Product
            {
                Name = JsonSerializer.Serialize(dto.Name),
                Description = JsonSerializer.Serialize(dto.Description),
                Price = dto.Price,
                ImageUrl = dto.ImageUrl,
                CategoryId = dto.CategoryId,
                IsAvailable = true
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return Ok(new { ProductId = product.Id });
        }

        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryDto dto)
        {
            var category = new Category
            {
                Name = JsonSerializer.Serialize(dto.Name),
                ImageUrl = dto.ImageUrl,
                IsActive = true
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(new { CategoryId = category.Id });
        }
    }
}

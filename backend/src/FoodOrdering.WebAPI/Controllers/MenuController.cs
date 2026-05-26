using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodOrdering.Application.DTOs.Menu;
using FoodOrdering.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace FoodOrdering.WebAPI.Controllers
{
    [ApiController]
    [Route("api/menu")]
    public class MenuController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MenuController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories
                .Where(c => c.IsActive)
                .ToListAsync();

            var result = categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                ImageUrl = c.ImageUrl,
                IsActive = c.IsActive,
                Name = JsonSerializer.Deserialize<Dictionary<string, string>>(c.Name) ?? new()
            });

            return Ok(result);
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetProducts([FromQuery] Guid? categoryId)
        {
            var query = _context.Products.Where(p => p.IsAvailable);
            
            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            var products = await query.ToListAsync();

            var result = products.Select(p => new ProductDto
            {
                Id = p.Id,
                CategoryId = p.CategoryId,
                ImageUrl = p.ImageUrl,
                IsAvailable = p.IsAvailable,
                Price = p.Price,
                Name = JsonSerializer.Deserialize<Dictionary<string, string>>(p.Name) ?? new(),
                Description = JsonSerializer.Deserialize<Dictionary<string, string>>(p.Description) ?? new()
            });

            return Ok(result);
        }
    }
}

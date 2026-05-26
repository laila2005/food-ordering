using System;
using System.Collections.Generic;

namespace FoodOrdering.Application.DTOs.Menu
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public Dictionary<string, string> Name { get; set; } = new();
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; }
    }
}

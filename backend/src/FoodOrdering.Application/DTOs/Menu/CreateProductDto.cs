using System;
using System.Collections.Generic;

namespace FoodOrdering.Application.DTOs.Menu
{
    public class CreateProductDto
    {
        public Dictionary<string, string> Name { get; set; } = new();
        public Dictionary<string, string> Description { get; set; } = new();
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public Guid CategoryId { get; set; }
    }
}

using System;
using System.Collections.Generic;

namespace FoodOrdering.Domain.Entities
{
    public class Category
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        // Localized name represented as JSONB in database (e.g. {"en": "Burgers", "ar": "برجر"})
        public string Name { get; set; } = "{}"; 
        
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;
        
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}

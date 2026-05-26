using System;

namespace FoodOrdering.Domain.Entities
{
    public class Product
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        // Localized name represented as JSONB in database (e.g. {"en": "Double Cheeseburger", "ar": "دبل تشيز برجر"})
        public string Name { get; set; } = "{}";
        
        // Localized description represented as JSONB in database (e.g. {"en": "Delicious double cheeseburger", "ar": "دبل تشيز برجر لذيذ"})
        public string Description { get; set; } = "{}";
        
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        
        public Guid? CategoryId { get; set; }
        public Category? Category { get; set; }
        
        public bool IsAvailable { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

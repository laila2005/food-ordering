using System;
using System.Collections.Generic;
using FoodOrdering.Domain.Enums;

namespace FoodOrdering.Domain.Entities
{
    public class Order
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid UserId { get; set; }
        public User? User { get; set; }
        
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public string PaymentMethod { get; set; } = "CashOnDelivery"; // "Stripe", "CashOnDelivery"
        public string PaymentStatus { get; set; } = "Pending"; // "Pending", "Paid", "Failed"
        
        public decimal TotalAmount { get; set; }
        public string DeliveryAddress { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? AddressDetails { get; set; }
        public string? Notes { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}

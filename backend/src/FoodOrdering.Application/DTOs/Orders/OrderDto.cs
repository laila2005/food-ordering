using System;
using System.Collections.Generic;

namespace FoodOrdering.Application.DTOs.Orders
{
    public class OrderDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string DeliveryAddress { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<OrderItemResponseDto> Items { get; set; } = new();
    }

    public class OrderItemResponseDto
    {
        public Guid ProductId { get; set; }
        public Dictionary<string, string> ProductName { get; set; } = new();
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}

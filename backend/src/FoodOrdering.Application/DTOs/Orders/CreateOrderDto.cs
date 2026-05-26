using System;
using System.Collections.Generic;

namespace FoodOrdering.Application.DTOs.Orders
{
    public class CreateOrderDto
    {
        public string PaymentMethod { get; set; } = "CashOnDelivery"; // "Stripe", "CashOnDelivery"
        public string DeliveryAddress { get; set; } = string.Empty;
        public List<CreateOrderItemDto> Items { get; set; } = new();
    }

    public class CreateOrderItemDto
    {
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
    }
}

using System;
using FoodOrdering.Domain.Enums;

namespace FoodOrdering.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public Role Role { get; set; } = Role.Customer;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

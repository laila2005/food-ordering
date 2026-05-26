using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FoodOrdering.Domain.Entities;

using FoodOrdering.Application.Interfaces;
using FoodOrdering.Domain.Enums;

namespace FoodOrdering.Infrastructure.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context, IPasswordHasher passwordHasher)
        {
            await context.Database.EnsureCreatedAsync();

            // Seed Default System Accounts
            if (!await context.Users.AnyAsync(u => u.Email.ToLower() == "admin@quickbite.com"))
            {
                var adminUser = new User
                {
                    Email = "admin@quickbite.com",
                    FullName = "System Admin",
                    PasswordHash = passwordHasher.HashPassword("Admin123!"),
                    Role = Role.Admin
                };
                context.Users.Add(adminUser);
            }

            if (!await context.Users.AnyAsync(u => u.Email.ToLower() == "customer@quickbite.com"))
            {
                var customerUser = new User
                {
                    Email = "customer@quickbite.com",
                    FullName = "Jane Customer",
                    PasswordHash = passwordHasher.HashPassword("Customer123!"),
                    Role = Role.Customer
                };
                context.Users.Add(customerUser);
            }

            await context.SaveChangesAsync();

            if (await context.Categories.AnyAsync())
            {
                return;
            }

            // 1. Seed Categories
            var categories = new List<Category>
            {
                new() {
                    Name = JsonSerializer.Serialize(new Dictionary<string, string> { { "en", "Burgers" }, { "ar", "برجر" } }),
                    ImageUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80"
                },
                new() {
                    Name = JsonSerializer.Serialize(new Dictionary<string, string> { { "en", "Pizza" }, { "ar", "بيتزا" } }),
                    ImageUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80"
                },
                new() {
                    Name = JsonSerializer.Serialize(new Dictionary<string, string> { { "en", "Drinks" }, { "ar", "مشروبات" } }),
                    ImageUrl = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=400&q=80"
                }
            };

            context.Categories.AddRange(categories);
            await context.SaveChangesAsync();

            // 2. Seed Products
            var burgersCategory = categories[0];
            var pizzaCategory = categories[1];
            var drinksCategory = categories[2];

            var products = new List<Product>
            {
                new() {
                    Name = JsonSerializer.Serialize(new Dictionary<string, string> { { "en", "Double Cheeseburger" }, { "ar", "دبل تشيز برجر" } }),
                    Description = JsonSerializer.Serialize(new Dictionary<string, string> { { "en", "Two beef patties, cheddar cheese, lettuce, tomato, and special sauce." }, { "ar", "شريحتان من لحم البقر، جبنة شيدر، خس، طماطم، وصلصة خاصة." } }),
                    Price = 9.99m,
                    ImageUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
                    CategoryId = burgersCategory.Id
                },
                new() {
                    Name = JsonSerializer.Serialize(new Dictionary<string, string> { { "en", "Spicy Zinger Burger" }, { "ar", "زنجر برجر حار" } }),
                    Description = JsonSerializer.Serialize(new Dictionary<string, string> { { "en", "Crispy spicy chicken breast, lettuce, mayonnaise, and cheese." }, { "ar", "صدر دجاج مقرمش حار، خس، مايونيز، وجبنة." } }),
                    Price = 8.49m,
                    ImageUrl = "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=400&q=80",
                    CategoryId = burgersCategory.Id
                },
                new() {
                    Name = JsonSerializer.Serialize(new Dictionary<string, string> { { "en", "Pepperoni Pizza" }, { "ar", "بيتزا بيبيروني" } }),
                    Description = JsonSerializer.Serialize(new Dictionary<string, string> { { "en", "Tomato sauce, mozzarella cheese, and premium pepperoni." }, { "ar", "صلصة طماطم، جبنة موزاريلا، وبيبيروني فاخر." } }),
                    Price = 12.99m,
                    ImageUrl = "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&q=80",
                    CategoryId = pizzaCategory.Id
                },
                new() {
                    Name = JsonSerializer.Serialize(new Dictionary<string, string> { { "en", "Margherita Pizza" }, { "ar", "بيتزا مارغريتا" } }),
                    Description = JsonSerializer.Serialize(new Dictionary<string, string> { { "en", "Tomato sauce, fresh mozzarella, basil, and olive oil." }, { "ar", "صلصة طماطم، موزاريلا طازجة، ريحان، وزيت زيتون." } }),
                    Price = 11.49m,
                    ImageUrl = "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80",
                    CategoryId = pizzaCategory.Id
                },
                new() {
                    Name = JsonSerializer.Serialize(new Dictionary<string, string> { { "en", "Coca Cola" }, { "ar", "كوكا كولا" } }),
                    Description = JsonSerializer.Serialize(new Dictionary<string, string> { { "en", "Chilled 330ml can." }, { "ar", "علبة باردة سعة 330 مل." } }),
                    Price = 1.99m,
                    ImageUrl = "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80",
                    CategoryId = drinksCategory.Id
                },
                new() {
                    Name = JsonSerializer.Serialize(new Dictionary<string, string> { { "en", "Fresh Orange Juice" }, { "ar", "عصير برتقال طازج" } }),
                    Description = JsonSerializer.Serialize(new Dictionary<string, string> { { "en", "Naturally squeezed fresh oranges." }, { "ar", "عصير برتقال طازج معصور طبيعياً." } }),
                    Price = 3.49m,
                    ImageUrl = "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=400&q=80",
                    CategoryId = drinksCategory.Id
                }
            };

            context.Products.AddRange(products);
            await context.SaveChangesAsync();
        }
    }
}

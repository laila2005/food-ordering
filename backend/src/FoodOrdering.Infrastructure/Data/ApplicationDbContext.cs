using Microsoft.EntityFrameworkCore;
using FoodOrdering.Domain.Entities;

namespace FoodOrdering.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure multi-language columns as JSONB in PostgreSQL
            modelBuilder.Entity<Category>(entity =>
            {
                entity.Property(c => c.Name)
                    .HasColumnType("jsonb")
                    .IsRequired();
            });

            modelBuilder.Entity<Product>(entity =>
            {
                entity.Property(p => p.Name)
                    .HasColumnType("jsonb")
                    .IsRequired();

                entity.Property(p => p.Description)
                    .HasColumnType("jsonb")
                    .IsRequired();

                entity.Property(p => p.Price)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.Property(o => o.TotalAmount)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(o => o.Status)
                    .HasConversion<string>();
            });

            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.Property(oi => oi.UnitPrice)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();
            });
        }
    }
}

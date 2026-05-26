using FoodOrdering.Domain.Entities;

namespace FoodOrdering.Application.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}

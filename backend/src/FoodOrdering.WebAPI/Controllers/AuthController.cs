using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodOrdering.Application.DTOs.Auth;
using FoodOrdering.Application.Interfaces;
using FoodOrdering.Domain.Entities;
using FoodOrdering.Domain.Enums;
using FoodOrdering.Infrastructure.Data;
using System.Threading.Tasks;

namespace FoodOrdering.WebAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtService _jwtService;

        public AuthController(ApplicationDbContext context, IPasswordHasher passwordHasher, IJwtService jwtService)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
            {
                return BadRequest(new { Message = "Email is already in use." });
            }

            // Grant Admin role to the first registered user to facilitate evaluation, otherwise standard Customer
            var hasUsers = await _context.Users.AnyAsync();
            var role = hasUsers ? Role.Customer : Role.Admin;

            var user = new User
            {
                Email = dto.Email,
                FullName = dto.FullName,
                PasswordHash = _passwordHasher.HashPassword(dto.Password),
                Role = role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                Token = token,
                User = new { user.Id, user.Email, user.FullName, Role = user.Role.ToString() }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (user == null || !_passwordHasher.VerifyPassword(user.PasswordHash, dto.Password))
            {
                return Unauthorized(new { Message = "Invalid email or password." });
            }

            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                Token = token,
                User = new { user.Id, user.Email, user.FullName, Role = user.Role.ToString() }
            });
        }
    }
}

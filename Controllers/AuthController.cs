﻿using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BookingSalonHair.DTOs;
using BookingSalonHair.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using SalonBooking.API.Data;

namespace BookingSalonHair.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly SalonContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(SalonContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDTO model)
        {
            if (string.IsNullOrWhiteSpace(model.Email))
                return BadRequest("Email không được để trống.");

            if (await _context.Users.AnyAsync(u => u.Email == model.Email))
                return BadRequest("Email đã được sử dụng.");

            if (await _context.Users.AnyAsync(u => u.Phone == model.Phone))
                return BadRequest("Số điện thoại đã được sử dụng.");

            if (string.IsNullOrWhiteSpace(model.Password))
                return BadRequest("Mật khẩu không được để trống.");

            var user = new User
            {
                FullName = model.FullName,
                Email = model.Email,
                PasswordHash = Convert.ToBase64String(Encoding.UTF8.GetBytes(model.Password)),
                Phone = model.Phone,
                Role = model.Role,
                IsGuest = model.IsGuest
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đăng ký thành công" });
        }




        // POST: api/Auth/login
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDTO model)
        {
            // Tìm user bằng Email
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == model.Email);
            if (user == null)
            {
                return Unauthorized("Email không đúng.");
            }

            var hashInput = Convert.ToBase64String(Encoding.UTF8.GetBytes(model.Password));
            if (hashInput != user.PasswordHash)
            {
                return Unauthorized("Mật khẩu không đúng.");
            }

            // Tạo Token JWT
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);

            // Các claim thông thường
            var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.FullName),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Role, user.Role.ToLower()),
         new Claim("staffId", user.Id.ToString())// Thêm Role vào claim
    };

            // Thêm claim StaffId nếu user là Staff và có trường StaffId trong bảng User
            if (user.Role.ToLower() == "staff" && user.Id != null)
            {
                claims.Add(new Claim("StaffId", user.Id.ToString()));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(2),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new { token = tokenString });
        }
    }
}

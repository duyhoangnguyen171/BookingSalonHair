using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BookingSalonHair.DTOs;
using BookingSalonHair.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SalonBooking.API.Data;

namespace BookingSalonHair.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // Chỉ Admin được phép truy xuất toàn bộ user
    public class UsersController : ControllerBase
    {
        private readonly SalonContext _context;

        public UsersController(SalonContext context)
        {
            _context = context;
        }

        // GET: api/Users
        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();
            return user;
        }

        // PUT: api/Users/5
        [HttpPost("PutUser")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> PutUser(UserDTO userDto)
        {
            var existingUser = await _context.Users.FindAsync(userDto.Id);
            if (existingUser == null)
                return NotFound();

            // Map fields from DTO to entity
            existingUser.FullName = userDto.FullName;
            existingUser.Email = userDto.Email;
            existingUser.Phone = userDto.Phone;
            existingUser.Role = userDto.Role;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log error here if needed
                return StatusCode(500, "Lỗi khi cập nhật người dùng.");
            }

            return NoContent();
        }


        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("bookedByStaff/{staffId}")]
        [Authorize(Roles = "staff,admin")] // Cho cả staff và admin
        public async Task<ActionResult<IEnumerable<WorkShift>>> GetWorkShiftsBookedByStaff(int staffId)
        {
            var shifts = await _context.WorkShifts
                .Where(ws => ws.Appointments.Any(a => a.StaffId == staffId))
                .Include(ws => ws.Appointments)
                .ToListAsync();

            return Ok(shifts);
        }
        // tạo user vãng lai
        [HttpPost("create-guest")]
        public async Task<IActionResult> CreateGuest([FromBody] GuestCustomerDto guestDto)
        {
            // Kiểm tra số điện thoại không trống
            if (string.IsNullOrWhiteSpace(guestDto.Phone))
                return BadRequest("Số điện thoại không được để trống.");

            // Kiểm tra xem số điện thoại đã tồn tại chưa
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Phone == guestDto.Phone);

            if (existingUser != null)
            {
                // Nếu khách vãng lai đã tồn tại, trả về id của khách vãng lai
                return Ok(new { id = existingUser.Id });
            }

            // Tạo khách vãng lai
            var guest = new User
            {
                FullName = guestDto.FullName,
                Phone = guestDto.Phone,
                Email = null,  // Nếu là khách vãng lai, Email sẽ là null
                PasswordHash = null,  // Chưa có mật khẩu
                Role = "Customer",  // Vai trò khách hàng
                IsGuest = true  // Đánh dấu là khách vãng lai
            };

            // Thêm khách vào cơ sở dữ liệu
            _context.Users.Add(guest);
            await _context.SaveChangesAsync();

            // Trả về id của khách
            return Ok(new { id = guest.Id });
        }

    }
}

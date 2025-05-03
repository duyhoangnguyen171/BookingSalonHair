using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BookingSalonHair.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SalonBooking.API.Data;
using System.Security.Claims;

namespace BookingSalonHair.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly SalonContext _context;

        public AppointmentsController(SalonContext context)
        {
            _context = context;
        }

        // GET: api/Appointments
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointments()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // Lấy userId từ Claims
            var appointments = await _context.Appointments
                .Where(a => a.CustomerId.ToString() == userId || User.IsInRole("admin") || User.IsInRole("staff"))
                .Include(a => a.Customer)
                .Include(a => a.Staff)
                .Include(a => a.Service)
                .Include(a => a.WorkShift)
                .ToListAsync();

            return appointments;
        }

        // GET: api/Appointments/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Appointment>> GetAppointment(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var appointment = await _context.Appointments
                .Include(a => a.Customer)
                .Include(a => a.Staff)
                .Include(a => a.Service)
                .Include(a => a.WorkShift)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null)
                return NotFound();

            // Kiểm tra quyền truy cập
            if (appointment.CustomerId.ToString() != userId && !User.IsInRole("admin") && !User.IsInRole("staff"))
                return Forbid(); // Chỉ admin, staff hoặc người tạo mới có quyền truy cập

            return appointment;
        }

        // POST: api/Appointments
        [HttpPost]
        [Authorize(Roles = "staff,admin,customer")]
        public async Task<ActionResult<Appointment>> PostAppointment(Appointment appointment)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState); // Kiểm tra tính hợp lệ của dữ liệu

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Nếu là customer, chỉ cho phép tạo cuộc hẹn cho chính mình
            if (User.IsInRole("customer") && appointment.CustomerId.ToString() != userId)
                return Forbid();

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, appointment);
        }

        // PUT: api/Appointments/5
        [HttpPut("{id}")]
        [Authorize(Roles = "staff,admin")]
        public async Task<IActionResult> PutAppointment(int id, Appointment appointment)
        {
            if (id != appointment.Id)
                return BadRequest();

            // Kiểm tra quyền sửa chữa cuộc hẹn
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var existingAppointment = await _context.Appointments.FindAsync(id);

            if (existingAppointment == null)
                return NotFound();

            // Chỉ admin hoặc staff đã được giao công việc mới có quyền sửa
            if (existingAppointment.StaffId.ToString() != userId && !User.IsInRole("admin"))
                return Forbid(); // Cấm truy cập

            _context.Entry(appointment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Appointments.Any(e => e.Id == id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Appointments/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
                return NotFound();

            // Kiểm tra quyền xóa
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (appointment.StaffId.ToString() != userId && !User.IsInRole("admin"))
                return Forbid(); // Chỉ admin hoặc staff đã được giao công việc mới có quyền xóa

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        // PUT: api/Appointments/5/status
        [HttpPut("{id}/status")]
        [Authorize(Roles = "staff,admin")]
        public async Task<IActionResult> UpdateAppointmentStatus(int id, AppointmentStatus status)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
                return NotFound(); // Nếu không tìm thấy lịch hẹn, trả về NotFound

            // Kiểm tra quyền sửa chữa lịch hẹn
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Chỉ admin hoặc staff đã được giao công việc mới có quyền cập nhật trạng thái
            if (appointment.StaffId.ToString() != userId && !User.IsInRole("admin"))
                return Forbid(); // Cấm truy cập nếu không phải admin hoặc nhân viên đã giao công việc

            // Cập nhật trạng thái lịch hẹn
            appointment.Status = status;

            // Lưu thay đổi vào cơ sở dữ liệu
            _context.Entry(appointment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync(); // Lưu thay đổi
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Appointments.Any(e => e.Id == id))
                    return NotFound();
                throw;
            }

            return NoContent(); // Trả về HTTP 204 NoContent nếu thành công
        }

    }
}


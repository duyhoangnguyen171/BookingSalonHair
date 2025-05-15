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
        // tạo lịch
        [HttpPost]
        [Authorize(Roles = "staff,admin,customer")]
        public async Task<ActionResult<Appointment>> PostAppointment(Appointment appointment)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Kiểm tra quyền của khách hàng (customer)
            if (User.IsInRole("customer") && appointment.CustomerId.ToString() != userId)
                return Forbid();

            // Kiểm tra sự tồn tại của khách hàng vãng lai
            var customer = await _context.Users.FindAsync(appointment.CustomerId);
            if (customer == null)
            {
                return NotFound("Khách hàng không tồn tại.");
            }

            // Tạo lịch hẹn cho khách hàng
            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            // Load các liên kết navigation nếu cần thiết
            await _context.Entry(appointment).Reference(a => a.Customer).LoadAsync();
            await _context.Entry(appointment).Reference(a => a.Service).LoadAsync();
            await _context.Entry(appointment).Reference(a => a.Staff).LoadAsync();
            await _context.Entry(appointment).Reference(a => a.WorkShift).LoadAsync();

            return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, appointment);
        }



        // PUT: api/Appointments/5
        [HttpPut("{id}")]
        [Authorize(Roles = "staff,admin")]
        public async Task<IActionResult> PutAppointment(int id, Appointment appointment)
        {
            try
            {
                if (id != appointment.Id)
                    return BadRequest("ID trong URL không khớp với ID trong payload.");

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("Token không hợp lệ hoặc thiếu thông tin người dùng.");

                var existingAppointment = await _context.Appointments.FindAsync(id);
                if (existingAppointment == null)
                    return NotFound($"Không tìm thấy lịch hẹn with ID {id}.");

                if (existingAppointment.StaffId.ToString() != userId && !User.IsInRole("admin"))
                    return Forbid("Bạn không có quyền chỉnh sửa lịch hẹn này.");

                // Ghi log AppointmentDate đầu vào
                Console.WriteLine($"AppointmentDate đầu vào: {appointment.AppointmentDate} (Kind: {appointment.AppointmentDate.Kind})");

                // Chuẩn hóa AppointmentDate sang UTC
                var utcAppointmentDate = DateTime.SpecifyKind(appointment.AppointmentDate.ToUniversalTime(), DateTimeKind.Utc);
                Console.WriteLine($"AppointmentDate UTC chuẩn hóa: {utcAppointmentDate} (Kind: {utcAppointmentDate.Kind})");

                // Cập nhật các trường
                existingAppointment.AppointmentDate = utcAppointmentDate;
                existingAppointment.CustomerId = appointment.CustomerId;
                existingAppointment.StaffId = appointment.StaffId;
                existingAppointment.ServiceId = appointment.ServiceId;
                existingAppointment.WorkShiftId = appointment.WorkShiftId;
                existingAppointment.Notes = appointment.Notes;
                existingAppointment.Status = appointment.Status;

                await _context.SaveChangesAsync();

                // Ghi log AppointmentDate đã lưu
                Console.WriteLine($"AppointmentDate đã lưu: {existingAppointment.AppointmentDate} (Kind: {existingAppointment.AppointmentDate.Kind})");

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Appointments.Any(e => e.Id == id))
                    return NotFound($"Lịch hẹn với ID {id} không tồn tại.");
                throw;
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new { error = "Lỗi cơ sở dữ liệu", detail = ex.InnerException?.Message ?? ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Lỗi server", detail = ex.Message });
            }
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
        [HttpPut("{id}/cancel")]
        [Authorize(Roles = "staff,admin,customer")]
        public async Task<IActionResult> CancelAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
                return NotFound(new { error = "Lịch hẹn không tồn tại" });

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // Cho phép customer hủy lịch hẹn của chính họ, hoặc staff/admin
            if (appointment.CustomerId.ToString() != userId &&
                appointment.StaffId.ToString() != userId &&
                !User.IsInRole("admin"))
                return Forbid("Bạn không có quyền hủy lịch hẹn này");

            appointment.Status = AppointmentStatus.Canceled; // Đã hủy
            appointment.UpdatedAt = DateTime.UtcNow;

            _context.Entry(appointment).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Hủy lịch hẹn thành công" });
        }

    }
}


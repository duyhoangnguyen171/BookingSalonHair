using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BookingSalonHair.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SalonBooking.API.Data;
using System.Security.Claims;
using BookingSalonHair.DTOs;
using BookingSalonHair.Helpers;

namespace BookingSalonHair.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly SalonContext _context;
        private readonly EmailHelper _emailHelper;
        public AppointmentsController(SalonContext context, EmailHelper emailHelper)
        {
            _context = context;
            _emailHelper = emailHelper;
        }

        // GET: api/Appointments
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAppointments([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // Lấy userId từ Claims

            // Xây dựng truy vấn cơ bản
            var query = _context.Appointments
                .Where(a => a.CustomerId.ToString() == userId || User.IsInRole("admin") || User.IsInRole("staff"));

            // Đếm tổng số bản ghi để tính tổng số trang
            var totalCount = await query.CountAsync();

            // Lấy danh sách lịch hẹn với phân trang và chọn các cột cần thiết
            var appointments = await query
                .Select(a => new
                {
                    a.Id,
                    a.AppointmentDate,
                    a.CustomerId,
                    a.StaffId,
                    a.Status,
                    a.ServiceId,
                    a.Notes,
                    CustomerFullName = a.Customer.FullName,
                    StaffFullName = a.Staff.FullName,
                    AppointmentServices = a.AppointmentServices
                        .Select(s => new
                        {
                            s.ServiceId,
                            ServiceName = s.Service.Name
                        })
                        .ToList()
                })
                .OrderBy(a => a.Id) // Sắp xếp theo Id (có thể thay bằng AppointmentDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            return Ok(new
            {
                Data = appointments,
                TotalCount = totalCount,
                TotalPages = totalPages,
                CurrentPage = page
            });
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
                .Include(a => a.AppointmentServices)
                .ThenInclude(a => a.Service).Include(a => a.WorkShift).FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null)
                return NotFound();

            // Kiểm tra quyền truy cập
            if (appointment.CustomerId.ToString() != userId && !User.IsInRole("admin") && !User.IsInRole("staff"))
                return Forbid(); // Chỉ admin, staff hoặc người tạo mới có quyền truy cập

            return appointment;
        }
        //[HttpPost]
        //[Authorize(Roles = "staff,admin,customer")]
        //public async Task<ActionResult<Appointment>> PostAppointment(AppointmentServiceCreateDto dto)
        //{
        //    if (dto == null)
        //        return BadRequest("Dữ liệu không được null.");

        //    if (dto.ServiceIds == null || !dto.ServiceIds.Any())
        //        return BadRequest("Phải chọn ít nhất một dịch vụ.");

        //    if (dto.AppointmentDate < DateTime.UtcNow)
        //        return BadRequest("Ngày đặt lịch phải là ngày trong tương lai.");

        //    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        //    // Nếu là khách hàng thì chỉ được đặt lịch cho chính mình
        //    if (User.IsInRole("customer") && dto.CustomerId?.ToString() != userId)
        //        return Forbid("Bạn không có quyền đặt lịch cho người khác.");

        //    var customer = await _context.Users.FindAsync(dto.CustomerId);
        //    if (customer == null)
        //        return NotFound("Khách hàng không tồn tại.");

        //    if (dto.StaffId != null)
        //    {
        //        var staff = await _context.Users.FindAsync(dto.StaffId);
        //        if (staff == null)
        //            return NotFound("Nhân viên không tồn tại.");
        //    }

        //    // Tạo đối tượng lịch hẹn mới
        //    var appointment = new Appointment
        //    {
        //        AppointmentDate = dto.AppointmentDate,
        //        Notes = dto.Notes,
        //        CustomerId = dto.CustomerId,
        //        StaffId = dto.StaffId,
        //        WorkShiftId = dto.WorkShiftId,
        //        Status = Models.AppointmentStatus.Pending,
        //        CreatedAt = DateTime.UtcNow,
        //        UpdatedAt = DateTime.UtcNow,
        //        AppointmentServices = dto.ServiceIds.Select(serviceId => new AppointmentService { ServiceId = serviceId }).ToList()
        //    };

        //    _context.Appointments.Add(appointment);
        //    await _context.SaveChangesAsync();

        //    // Load navigation properties
        //    await _context.Entry(appointment).Reference(a => a.Customer).LoadAsync();
        //    await _context.Entry(appointment).Reference(a => a.Staff).LoadAsync();
        //    await _context.Entry(appointment).Reference(a => a.WorkShift).LoadAsync();
        //    await _context.Entry(appointment).Collection(a => a.AppointmentServices).LoadAsync();
        //    foreach (var appService in appointment.AppointmentServices)
        //    {
        //        await _context.Entry(appService).Reference(a => a.Service).LoadAsync();
        //    }

        //    // Gửi email thông báo (nếu có lỗi thì chỉ ghi log)
        //    try
        //    {
        //        await _emailHelper.SendEmailAsync(customer.Email, "Thông báo đặt lịch", $"Xin chào {customer.FullName}, bạn đã đặt lịch hẹn vào lúc {DateTime.Now:HH:mm dd/MM/yyyy}");
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"Lỗi gửi email: {ex.Message}");
        //    }

        //    return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, appointment);
        //}
        [HttpPost]
        [Authorize(Roles = "staff,admin,customer")]
        public async Task<ActionResult<Appointment>> PostAppointment(AppointmentServiceCreateDto dto)
        {
            if (dto == null)
                return BadRequest("Dữ liệu không được null.");

            if (dto.ServiceIds == null || !dto.ServiceIds.Any())
                return BadRequest("Phải chọn ít nhất một dịch vụ.");

            if (dto.AppointmentDate < DateTime.UtcNow)
                return BadRequest("Ngày đặt lịch phải là ngày trong tương lai.");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Nếu là customer thì chỉ được đặt lịch cho chính mình
            if (User.IsInRole("customer") && dto.CustomerId?.ToString() != userId)
                return Forbid("Bạn không có quyền đặt lịch cho người khác.");

            var customer = await _context.Users.FindAsync(dto.CustomerId);
            if (customer == null)
                return NotFound("Khách hàng không tồn tại.");

            if (dto.StaffId != null)
            {
                var staff = await _context.Users.FindAsync(dto.StaffId);
                if (staff == null)
                    return NotFound("Nhân viên không tồn tại.");
            }

            var appointment = new Appointment
            {
                AppointmentDate = dto.AppointmentDate,
                Notes = dto.Notes,
                CustomerId = dto.CustomerId,
                StaffId = dto.StaffId,
                WorkShiftId = dto.WorkShiftId,
                Status = Models.AppointmentStatus.Accepted,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AppointmentServices = dto.ServiceIds.Select(serviceId => new AppointmentService { ServiceId = serviceId }).ToList()
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();


            await _context.Entry(appointment).Reference(a => a.Customer).LoadAsync();
            await _context.Entry(appointment).Reference(a => a.Staff).LoadAsync();
            await _context.Entry(appointment).Reference(a => a.WorkShift).LoadAsync();
            await _context.Entry(appointment).Collection(a => a.AppointmentServices).LoadAsync();
            foreach (var appService in appointment.AppointmentServices)
            {
                await _context.Entry(appService).Reference(a => a.Service).LoadAsync();
            }
            try
            {
                await _emailHelper.SendEmailAsync(customer.Email, "Thông báo đặt lịch", $"Xin chào {customer.FullName}, bạn đã đặt lịch hẹn vào lúc {DateTime.Now:HH:mm dd/MM/yyyy}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi gửi email: {ex.Message}");
            }


            return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, appointment);
        }



        [HttpPut("{id}")]
        [Authorize(Roles = "staff,admin")]
        public async Task<IActionResult> PutAppointment(int id, AppointmentUpdateDto appointment)
        {
            try
            {
                if (id != appointment.Id)
                    return BadRequest("ID trong URL không khớp với ID trong payload.");

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("Token không hợp lệ hoặc thiếu thông tin người dùng.");

                var existingAppointment = await _context.Appointments
                    .Include(a => a.AppointmentServices)
                    .FirstOrDefaultAsync(a => a.Id == id);
                if (existingAppointment == null)
                    return NotFound($"Không tìm thấy lịch hẹn với ID {id}.");

                if (existingAppointment.StaffId.ToString() != userId && !User.IsInRole("admin"))
                    return Forbid("Bạn không có quyền chỉnh sửa lịch hẹn này.");

                if (!_context.Users.Any(u => u.Id == appointment.CustomerId))
                    return NotFound("Khách hàng không tồn tại.");
                if (appointment.StaffId != null && !_context.Users.Any(u => u.Id == appointment.StaffId))
                    return NotFound("Nhân viên không tồn tại.");
                if (appointment.WorkShiftId != null && !_context.WorkShifts.Any(w => w.Id == appointment.WorkShiftId))
                    return NotFound("Ca làm việc không tồn tại.");
                if (appointment.ServiceIds == null || !appointment.ServiceIds.Any())
                    return BadRequest("Phải chọn ít nhất một dịch vụ.");
                var invalidServiceIds = appointment.ServiceIds
                    .Where(sid => !_context.Services.Any(s => s.Id == sid))
                    .ToList();
                if (invalidServiceIds.Any())
                    return BadRequest($"Dịch vụ không tồn tại: {string.Join(", ", invalidServiceIds)}");

                var utcAppointmentDate = DateTime.SpecifyKind(appointment.AppointmentDate.ToUniversalTime(), DateTimeKind.Utc);
                var conflictingAppointment = await _context.Appointments
                    .AnyAsync(a => a.Id != id
                        && a.StaffId == appointment.StaffId
                        && a.AppointmentDate == utcAppointmentDate
                        && a.Status != Models.AppointmentStatus.Canceled); // Sử dụng AppointmentStatus rõ ràng
                if (conflictingAppointment)
                    return BadRequest("Nhân viên đã có lịch hẹn vào thời điểm này.");

                Console.WriteLine($"AppointmentDate đầu vào: {appointment.AppointmentDate} (Kind: {appointment.AppointmentDate.Kind})");
                Console.WriteLine($"AppointmentDate UTC chuẩn hóa: {utcAppointmentDate} (Kind: {utcAppointmentDate.Kind})");

                existingAppointment.AppointmentDate = utcAppointmentDate;
                existingAppointment.CustomerId = appointment.CustomerId;
                existingAppointment.StaffId = appointment.StaffId;
                existingAppointment.WorkShiftId = appointment.WorkShiftId;
                existingAppointment.Notes = appointment.Notes;
                existingAppointment.Status = (Models.AppointmentStatus)appointment.Status; // Loại bỏ ép kiểu nếu namespace đã rõ ràng
                existingAppointment.UpdatedAt = DateTime.UtcNow;

                _context.AppointmentServices.RemoveRange(existingAppointment.AppointmentServices);
                existingAppointment.AppointmentServices = appointment.ServiceIds
                    .Select(serviceId => new AppointmentService { ServiceId = serviceId, AppointmentId = existingAppointment.Id })
                    .ToList();

                await _context.SaveChangesAsync();

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
        //PUT: api/Appointments/5
        //[HttpPut("{id}")]
        //[Authorize(Roles = "staff,admin")]
        //public async Task<IActionResult> PutAppointment(int id, Appointment appointment)
        //{
        //    try
        //    {
        //        if (id != appointment.Id)
        //            return BadRequest("ID trong URL không khớp với ID trong payload.");

        //        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        //        if (string.IsNullOrEmpty(userId))
        //            return Unauthorized("Token không hợp lệ hoặc thiếu thông tin người dùng.");

        //        var existingAppointment = await _context.Appointments.FindAsync(id);
        //        if (existingAppointment == null)
        //            return NotFound($"Không tìm thấy lịch hẹn with ID {id}.");

        //        if (existingAppointment.StaffId.ToString() != userId && !User.IsInRole("admin"))
        //            return Forbid("Bạn không có quyền chỉnh sửa lịch hẹn này.");

        //        // Ghi log AppointmentDate đầu vào
        //        Console.WriteLine($"AppointmentDate đầu vào: {appointment.AppointmentDate} (Kind: {appointment.AppointmentDate.Kind})");

        //        // Chuẩn hóa AppointmentDate sang UTC
        //        var utcAppointmentDate = DateTime.SpecifyKind(appointment.AppointmentDate.ToUniversalTime(), DateTimeKind.Utc);
        //        Console.WriteLine($"AppointmentDate UTC chuẩn hóa: {utcAppointmentDate} (Kind: {utcAppointmentDate.Kind})");

        //        // Cập nhật các trường
        //        existingAppointment.AppointmentDate = utcAppointmentDate;
        //        existingAppointment.CustomerId = appointment.CustomerId;
        //        existingAppointment.StaffId = appointment.StaffId;
        //        existingAppointment.ServiceId = appointment.ServiceId;
        //        existingAppointment.WorkShiftId = appointment.WorkShiftId;
        //        existingAppointment.Notes = appointment.Notes;
        //        existingAppointment.Status = appointment.Status;


        //        await _context.SaveChangesAsync();

        //        // Ghi log AppointmentDate đã lưu
        //        Console.WriteLine($"AppointmentDate đã lưu: {existingAppointment.AppointmentDate} (Kind: {existingAppointment.AppointmentDate.Kind})");

        //        return NoContent();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!_context.Appointments.Any(e => e.Id == id))
        //            return NotFound($"Lịch hẹn với ID {id} không tồn tại.");
        //        throw;
        //    }
        //    catch (DbUpdateException ex)
        //    {
        //        return StatusCode(500, new { error = "Lỗi cơ sở dữ liệu", detail = ex.InnerException?.Message ?? ex.Message });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { error = "Lỗi server", detail = ex.Message });
        //    }
        //}

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
        public async Task<IActionResult> UpdateAppointmentStatus(int id, BookingSalonHair.Models.AppointmentStatus status)
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

            appointment.Status = Models.AppointmentStatus.Canceled; // Đã hủy
            appointment.UpdatedAt = DateTime.UtcNow;

            _context.Entry(appointment).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Hủy lịch hẹn thành công" });
        }

    }
}


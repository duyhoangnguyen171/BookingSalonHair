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
    [Authorize(Roles = "admin,staff")]
    public class WorkShiftsController : ControllerBase
    {
        private readonly SalonContext _context;

        public WorkShiftsController(SalonContext context)
        {
            _context = context;
        }

        // GET: api/WorkShifts
        [HttpGet]
        [Authorize(Roles = "admin,staff")]
        public async Task<ActionResult<IEnumerable<WorkShift>>> GetWorkShifts()
        {
            return await _context.WorkShifts
                .Include(w => w.Appointments)
                .ToListAsync();
        }

        // GET: api/WorkShifts/id

        [HttpGet("{id}")]
        public async Task<IActionResult> GetWorkShift(int id)
        {
            var shift = await _context.WorkShifts
                .Include(w => w.Appointments)
                    .ThenInclude(a => a.Customer)
                .Include(w => w.Appointments)
                    .ThenInclude(a => a.Staff)
                .Include(w => w.UserWorkShifts)
                    .ThenInclude(uw => uw.User)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (shift == null)
                return NotFound();

            var result = new WorkShiftDetailDTO
            {
                Id = shift.Id,
                Name = shift.Name,
                StartTime = shift.StartTime,
                EndTime = shift.EndTime,
                ShiftType = shift.ShiftType,
                MaxUsers = shift.MaxUsers,
                Appointments = shift.Appointments.Select(a => new WorkShiftAppointmentDTO
                {
                    Id = a.Id,
                    ServiceId = a.ServiceId,
                    CustomerName = a.Customer?.FullName,
                    StaffId = a.StaffId,
                    StaffName = a.Staff?.FullName
                }).ToList(),
                RegisteredStaffs = shift.UserWorkShifts.Select(u => new SimpleUserDTO
                {
                    Id = u.User.Id,
                    FullName = u.User.FullName
                }).ToList()
            };

            return Ok(result);
        }




        // POST: api/WorkShifts
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<WorkShift>> PostWorkShift(WorkShift workShift)
        {
            _context.WorkShifts.Add(workShift);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetWorkShift), new { id = workShift.Id }, workShift);
        }

        // PUT: api/WorkShifts/id
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> PutWorkShift(int id, WorkShift workShift)
        {
            if (id != workShift.Id)
                return BadRequest();

            _context.Entry(workShift).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.WorkShifts.Any(w => w.Id == id))
                    return NotFound();
                throw;
            }
            return NoContent();
        }

        // DELETE: api/WorkShifts/id
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteWorkShift(int id)
        {
            var workShift = await _context.WorkShifts.FindAsync(id);
            if (workShift == null)
                return NotFound();
            _context.WorkShifts.Remove(workShift);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/WorkShifts/by-type?type=morning
        [HttpPost("by-type")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreateWorkShiftByType([FromBody] CreateWorkShiftDto dto)
        {
            // Lấy thời gian ca làm dựa vào ShiftType (sử dụng enum)
            var (start, end) = dto.ShiftType switch
            {
                ShiftType.Morning => (new TimeSpan(8, 0, 0), new TimeSpan(12, 0, 0)),
                ShiftType.Afternoon => (new TimeSpan(13, 0, 0), new TimeSpan(17, 0, 0)),
                ShiftType.Evening => (new TimeSpan(18, 0, 0), new TimeSpan(22, 0, 0)),
                _ => (TimeSpan.Zero, TimeSpan.Zero)
            };

            if (start == TimeSpan.Zero && end == TimeSpan.Zero)
                return BadRequest("Loại ca làm không hợp lệ.");

            // Lấy DayOfWeek từ ShiftType (hoặc người dùng có thể cung cấp trực tiếp)
            DayOfWeek dayOfWeek = dto.DayOfWeek; // Bạn có thể tính toán lại nếu muốn dựa trên ShiftType

            // Tạo ca làm mới với MaxUsers và DayOfWeek từ DTO
            var workShift = new WorkShift
            {
                Name = dto.Name,
                ShiftType = dto.ShiftType,
                StartTime = start,
                EndTime = end,
                MaxUsers = dto.MaxUsers, // Sử dụng số người tối đa từ DTO
                DayOfWeek = dayOfWeek // Lưu lại DayOfWeek từ DTO
            };

            _context.WorkShifts.Add(workShift);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Đã tạo ca làm {dto.ShiftType} vào ngày {dayOfWeek}",
                workShift
            });
        }



        // POST: api/WorkShifts/Register?shiftId=1&staffId=123
        [HttpPost("Register")]
        [Authorize(Roles = "staff, admin")]  // Cả staff và admin đều có quyền gọi API này
        public async Task<IActionResult> RegisterWorkShift([FromQuery] int shiftId, [FromQuery] int staffId, [FromQuery] int? customerId = null)
        {
            var workShift = await _context.WorkShifts
                .Include(w => w.Appointments)
                .FirstOrDefaultAsync(w => w.Id == shiftId);

            if (workShift == null)
                return NotFound("Ca làm không tồn tại.");

            // Kiểm tra quyền của người gọi API (staff hoặc admin)
            var isAdmin = User.IsInRole("admin");

            // Kiểm tra nếu người gọi là staff, thì phải có chỗ trống
            if (!isAdmin && workShift.Appointments.Count >= workShift.MaxUsers)
            {
                return BadRequest("Số lượng người đăng ký cho ca làm này đã đầy.");
            }

            // Nếu chỉ đăng ký ca làm cho nhân viên (không có khách hàng), thì không cần customerId
            if (customerId == null)
            {
                var appointment = new Appointment
                {
                    WorkShiftId = workShift.Id,
                    StaffId = staffId
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                return Ok("Đăng ký ca làm thành công.");
            }
            else
            {
                // Nếu đăng ký làm tóc, cần có cả StaffId và CustomerId
                var appointment = new Appointment
                {
                    WorkShiftId = workShift.Id,
                    StaffId = staffId,
                    CustomerId = customerId.Value // customerId phải có giá trị hợp lệ
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                return Ok("Đăng ký lịch làm tóc thành công.");
            }
        }


    }
}

using System;
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
    public class WorkShiftsController : ControllerBase
    {
        private readonly SalonContext _context;

        public WorkShiftsController(SalonContext context)
        {
            _context = context;
        }

        // GET: api/WorkShifts
        [HttpGet]
        [Authorize(Roles = "admin,staff,customer")]
        public async Task<ActionResult<IEnumerable<WorkShift>>> GetWorkShifts()
        {
            var workShifts = await _context.WorkShifts
                .AsNoTracking()
                .ToListAsync();

            return Ok(workShifts);
        }

        // GET: api/WorkShifts/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetWorkShift(int id)
        {
            var shift = await _context.WorkShifts
                .AsNoTracking()
                .Where(w => w.Id == id)
                .Select(w => new
                {
                    WorkShift = w,
                    Appointments = w.Appointments.Select(a => new
                    {
                        a.Id,
                        a.ServiceId,
                        a.StaffId,
                        CustomerName = a.Customer.FullName,
                        StaffName = a.Staff.FullName
                    }),
                    RegisteredStaffs = w.UserWorkShifts.Select(uw => new
                    {
                        uw.User.Id,
                        uw.User.FullName,
                        uw.IsApproved
                    })
                })
                .FirstOrDefaultAsync();

            if (shift == null)
                return NotFound();

            var result = new WorkShiftDetailDTO
            {
                Id = shift.WorkShift.Id,
                Name = shift.WorkShift.Name,
                StartTime = shift.WorkShift.StartTime,
                EndTime = shift.WorkShift.EndTime,
                ShiftType = shift.WorkShift.ShiftType,
                MaxUsers = shift.WorkShift.MaxUsers,
                Appointments = shift.Appointments.Select(a => new WorkShiftAppointmentDTO
                {
                    Id = a.Id,
                    ServiceId = a.ServiceId,
                    CustomerName = a.CustomerName,
                    StaffId = a.StaffId,
                    StaffName = a.StaffName
                }).ToList(),
                RegisteredStaffs = shift.RegisteredStaffs.Select(u => new SimpleUserDTO
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    IsApproved = u.IsApproved
                }).ToList()
            };

            return Ok(result);
        }

        // POST: api/WorkShifts
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<WorkShift>> PostWorkShift(WorkShift workShift)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.WorkShifts.Add(workShift);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWorkShift), new { id = workShift.Id }, workShift);
        }

        // PUT: api/WorkShifts/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> PutWorkShift(int id, WorkShift workShift)
        {
            if (id != workShift.Id)
                return BadRequest("ID không khớp.");

            _context.Entry(workShift).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.WorkShifts.AnyAsync(w => w.Id == id))
                    return NotFound();

                throw;
            }

            return NoContent();
        }

        // DELETE: api/WorkShifts/{id}
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

        // POST: api/WorkShifts/by-type
        [HttpPost("by-type")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreateWorkShiftByType([FromBody] CreateWorkShiftDto dto)
        {
            if (!Enum.IsDefined(typeof(ShiftType), dto.ShiftType))
                return BadRequest("Loại ca làm không hợp lệ.");

            var (start, end) = dto.ShiftType switch
            {
                ShiftType.Morning => (new TimeSpan(8, 0, 0), new TimeSpan(12, 0, 0)),
                ShiftType.Afternoon => (new TimeSpan(13, 0, 0), new TimeSpan(17, 0, 0)),
                ShiftType.Evening => (new TimeSpan(18, 0, 0), new TimeSpan(22, 0, 0)),
                _ => (TimeSpan.Zero, TimeSpan.Zero)
            };

            var workShift = new WorkShift
            {
                Name = dto.Name,
                ShiftType = dto.ShiftType,
                StartTime = start,
                EndTime = end,
                MaxUsers = dto.MaxUsers,
                DayOfWeek = dto.DayOfWeek
            };

            _context.WorkShifts.Add(workShift);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Đã tạo ca làm {dto.ShiftType} vào ngày {dto.DayOfWeek}",
                workShift
            });
        }
    }
}

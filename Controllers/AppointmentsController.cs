using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BookingSalonHair.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SalonBooking.API.Data;

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
        [Authorize]   // Chỉ người đã đăng nhập mới được xem
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointments()
        {
            return await _context.Appointments
                .Include(a => a.Customer)
                .Include(a => a.Staff)      // Bao gồm thông tin khách hàng
                .Include(a => a.Service)
                .Include(a => a.WorkShift)
                .ToListAsync();
        }

        // GET: api/Appointments/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Appointment>> GetAppointment(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Customer)
                .Include(a => a.Staff)
                .Include(a => a.Service)
                .Include(a => a.WorkShift)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null)
                return NotFound();

            return appointment;
        }

        // POST: api/Appointments
        [HttpPost]
        [Authorize(Roles = "staff,admin,customer")]
        public async Task<ActionResult<Appointment>> PostAppointment(Appointment appointment)
        {
            // Giả sử client gửi đầy đủ thông tin (bao gồm các FK: UserId, ServiceId, WorkShiftId)
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

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

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
        public async Task<ActionResult<IEnumerable<WorkShift>>> GetWorkShifts()
        {
            return await _context.WorkShifts
                .Include(w => w.Appointments)
                .ToListAsync();
        }

        // GET: api/WorkShifts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<WorkShift>> GetWorkShift(int id)
        {
            var shift = await _context.WorkShifts
                .Include(w => w.Appointments)
                .FirstOrDefaultAsync(w => w.Id == id);
            if (shift == null)
                return NotFound();
            return shift;
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

        // PUT: api/WorkShifts/5
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

        // DELETE: api/WorkShifts/5
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
    }
}

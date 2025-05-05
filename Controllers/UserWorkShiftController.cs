using BookingSalonHair.DTOs;
using BookingSalonHair.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SalonBooking.API.Data;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "admin,staff")]
public class UserWorkShiftController : ControllerBase
{
    private readonly SalonContext _context;

    public UserWorkShiftController(SalonContext context)
    {
        _context = context;
    }

    // GET: api/UserWorkShift/{userId}
    [HttpGet("{userId}")]
    public async Task<ActionResult<IEnumerable<WorkShift>>> GetWorkShiftsByUserId(int userId)
    {
        var userWorkShifts = await _context.UserWorkShifts
            .Where(uws => uws.UserId == userId)
            .Include(uws => uws.WorkShift)
            .Select(uws => uws.WorkShift)
            .ToListAsync();

        if (!userWorkShifts.Any())
        {
            return NotFound(new { message = "No work shifts found for the given user." });
        }

        return Ok(userWorkShifts);
    }

    // POST: api/UserWorkShift
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<UserWorkShiftDTO>> AssignUserToWorkShift([FromBody] UserWorkShiftDTO userWorkShiftDTO)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Invalid input data." });
        }

        var user = await _context.Users.FindAsync(userWorkShiftDTO.UserId);
        var workShift = await _context.WorkShifts.FindAsync(userWorkShiftDTO.WorkShiftId);

        if (user == null || workShift == null)
        {
            return NotFound(new { message = "User or WorkShift not found." });
        }

        var userWorkShift = new UserWorkShift
        {
            UserId = userWorkShiftDTO.UserId,
            WorkShiftId = userWorkShiftDTO.WorkShiftId,
            RegisteredAt = DateTime.Now
        };

        try
        {
            _context.UserWorkShifts.Add(userWorkShift);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error assigning work shift.", error = ex.Message });
        }

        return CreatedAtAction(nameof(GetWorkShiftsByUserId), new { userId = userWorkShift.UserId }, userWorkShiftDTO);
    }

    // DELETE: api/UserWorkShift/{userId}/{workShiftId}
    [HttpDelete("{userId}/{workShiftId}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> RemoveUserFromWorkShift(int userId, int workShiftId)
    {
        var userWorkShift = await _context.UserWorkShifts
            .FirstOrDefaultAsync(uws => uws.UserId == userId && uws.WorkShiftId == workShiftId);

        if (userWorkShift == null)
        {
            return NotFound(new { message = "UserWorkShift not found." });
        }

        _context.UserWorkShifts.Remove(userWorkShift);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

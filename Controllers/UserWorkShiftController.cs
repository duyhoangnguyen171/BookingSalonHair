using BookingSalonHair.DTOs;
using BookingSalonHair.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SalonBooking.API.Data;
using System.Security.Claims;

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
    // PUT: api/UserWorkShift/Approve?userId=5&workShiftId=3
    [HttpPut("Approve")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> ApproveUserWorkShift([FromQuery] int userId, [FromQuery] int workShiftId)
    {
        var userWorkShift = await _context.UserWorkShifts
            .FirstOrDefaultAsync(x => x.UserId == userId && x.WorkShiftId == workShiftId);

        if (userWorkShift == null)
            return NotFound(new { message = "Không tìm thấy đăng ký cần duyệt." });

        if (userWorkShift.IsApproved)
            return BadRequest(new { message = "Đăng ký đã được duyệt trước đó." });

        userWorkShift.IsApproved = true;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã duyệt ca làm thành công." });
    }

    // POST: api/UserWorkShift/register}
    [HttpPost("Register")]
    [Authorize(Roles = "staff,admin")]
    public async Task<IActionResult> RegisterSelfToWorkShift([FromBody] RegisterWorkShiftDTO registerWorkShiftDTO)
    {
        var userId = registerWorkShiftDTO.UserId;
        var workShiftId = registerWorkShiftDTO.WorkShiftId;
        var workShift = await _context.WorkShifts.FindAsync(workShiftId);

        if (workShift == null)
        {
            return NotFound(new { message = "Ca làm không tồn tại." });
        }

        // Kiểm tra xem nhân viên đã đăng ký ca làm này chưa
        bool alreadyRegistered = await _context.UserWorkShifts
            .AnyAsync(x => x.UserId == userId && x.WorkShiftId == workShiftId);

        if (alreadyRegistered)
        {
            return BadRequest(new { message = "Bạn đã đăng ký ca làm này rồi." });
        }

        // Kiểm tra xem người dùng là admin hay staff
        bool isAdmin = User.IsInRole("admin");
        bool isStaff = User.IsInRole("staff");

        var userWorkShift = new UserWorkShift
        {
            UserId = userId,
            WorkShiftId = workShiftId,
            RegisteredAt = DateTime.Now,
            // Nếu là admin, gán luôn là duyệt (IsApproved = true), nếu là staff thì là chờ duyệt (IsApproved = false)
            IsApproved = isAdmin ? true : false
        };

        _context.UserWorkShifts.Add(userWorkShift);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = isAdmin ? "Đã gán nhân viên vào ca làm thành công." : "Đăng ký ca làm thành công. Vui lòng chờ admin duyệt."
        });
    }
    //Lấy danh sach nhân viên chưa đăng ký ca làm đó
    // GET: api/UserWorkShift/staff-not-registered
    [HttpGet("staff-not-registered/{workShiftId}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<IEnumerable<User>>> GetStaffNotRegisteredForWorkShift(int workShiftId)
    {
        // Lấy tất cả nhân viên có vai trò "staff"
        var staffUsers = await _context.Users
                                        .Where(u => u.Role == "staff")
                                        .ToListAsync();

        // Lấy danh sách tất cả user đã đăng ký ca làm cho WorkShiftId
        var registeredStaffIds = await _context.UserWorkShifts
                                                .Where(uws => uws.WorkShiftId == workShiftId) // Lọc theo WorkShiftId
                                                .Select(uws => uws.UserId)
                                                .ToListAsync();

        // Lọc ra những nhân viên chưa đăng ký ca làm cho WorkShiftId
        var staffNotRegistered = staffUsers.Where(u => !registeredStaffIds.Contains(u.Id)).ToList();

        // Nếu không có nhân viên chưa đăng ký ca làm
        if (!staffNotRegistered.Any())
        {
            return NotFound(new { message = "Tất cả nhân viên đã đăng ký ca làm." });
        }

        // Trả về danh sách nhân viên chưa đăng ký ca làm cho WorkShiftId
        return Ok(staffNotRegistered);
    }



}

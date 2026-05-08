using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq; 
using System.Threading.Tasks;
using campus_backend.Repositories;

namespace campus_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceRepository _attendanceRepo;

        public AttendanceController(IAttendanceRepository attendanceRepo)
        {
            _attendanceRepo = attendanceRepo;
        }

        [HttpGet("professor/{profId}/today")]
        public async Task<IActionResult> GetTodaySchedules(string profId)
        {
            // The repository handles the current day internally.
            var schedules = await _attendanceRepo.GetTodaySchedulesForProfessorAsync(profId);
            return Ok(schedules);
        }

        [HttpGet("schedule/{scheduleId}/roster")]
        public async Task<IActionResult> GetScheduleAttendance(string scheduleId)
        {
            var roster = await _attendanceRepo.GetScheduleRosterAndAttendanceAsync(scheduleId);
            
            // Fixed CS0019 by using .Any() from System.Linq
            if (roster == null || !roster.Any()) 
                return NotFound(new { message = "Schedule not found or no students enrolled." });

            return Ok(roster);
        }
    }
}
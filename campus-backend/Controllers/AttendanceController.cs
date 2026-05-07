using Microsoft.AspNetCore.Mvc;
using System;
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
            string currentDay = DateTime.Now.ToString("ddd"); // e.g., 'Mon', 'Tue'
            var schedules = await _attendanceRepo.GetTodaySchedulesForProfessorAsync(profId, currentDay);
            return Ok(schedules);
        }

        [HttpGet("schedule/{scheduleId}/roster")]
        public async Task<IActionResult> GetScheduleAttendance(string scheduleId)
        {
            var roster = await _attendanceRepo.GetScheduleRosterAndAttendanceAsync(scheduleId);
            
            if (roster == null || roster.Count == 0) 
                return NotFound(new { message = "Schedule not found or no students enrolled." });

            return Ok(roster);
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using campus_backend.Models;
using campus_backend.Repositories;

namespace campus_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchedulesController : ControllerBase
    {
        private readonly IScheduleRepository _scheduleRepo;

        public SchedulesController(IScheduleRepository scheduleRepo)
        {
            _scheduleRepo = scheduleRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSchedules()
        {
            try
            {
                var schedules = await _scheduleRepo.GetAllSchedulesAsync();
                return Ok(schedules);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database Error", details = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateSchedule([FromBody] Schedule schedule)
        {
            try
            {
                await _scheduleRepo.CreateScheduleAsync(schedule);
                return Ok(new { message = "Schedule saved to Oracle database successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database Error", details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSchedule(string id, [FromBody] Schedule schedule)
        {
            try
            {
                schedule.Schedule_ID = id; // Ensure the ID matches
                await _scheduleRepo.UpdateScheduleAsync(schedule);
                return Ok(new { message = "Schedule updated successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database Error", details = ex.Message });
            }
        }
    }
}
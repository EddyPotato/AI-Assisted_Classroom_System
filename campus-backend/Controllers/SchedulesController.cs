using Microsoft.AspNetCore.Mvc;
using campus_backend.Models;
using campus_backend.Repositories;

namespace campus_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchedulesController : ControllerBase
    {
        private readonly IScheduleRepository _scheduleRepository;

        // Inject the repository registered in Program.cs
        public SchedulesController(IScheduleRepository scheduleRepository)
        {
            _scheduleRepository = scheduleRepository;
        }

        // GET: api/schedules
        [HttpGet]
        public async Task<IActionResult> GetSchedules()
        {
            try
            {
                var schedules = await _scheduleRepository.GetAllSchedulesAsync();
                return Ok(schedules);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database Error: " + ex.Message });
            }
        }

        // POST: api/schedules
        [HttpPost]
        public async Task<IActionResult> CreateSchedule([FromBody] Schedule schedule)
        {
            try
            {
                await _scheduleRepository.CreateScheduleAsync(schedule);
                return Ok(new { message = "Schedule created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create: " + ex.Message });
            }
        }

        // PUT: api/schedules/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSchedule(string id, [FromBody] Schedule schedule)
        {
            try
            {
                // Ensure the ID from the URL is applied to the model before updating
                schedule.Schedule_ID = id; 
                await _scheduleRepository.UpdateScheduleAsync(schedule);
                return Ok(new { message = "Schedule updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update: " + ex.Message });
            }
        }

        // DELETE: api/schedules/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchedule(string id)
        {
            await _scheduleRepository.DeleteScheduleAsync(id);
            return Ok(new { message = "Schedule deleted successfully!" });
        }
    }
}
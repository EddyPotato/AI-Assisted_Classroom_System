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
    }
}
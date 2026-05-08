using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;
using campus_backend.Models;
using campus_backend.Repositories;

namespace campus_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SchedulesController : ControllerBase
    {
        private readonly IScheduleRepository _scheduleRepository;

        public SchedulesController(IScheduleRepository scheduleRepository)
        {
            _scheduleRepository = scheduleRepository;
        }

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
                return StatusCode(500, new { message = "Database error retrieving schedules.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetScheduleById(string id)
        {
            try
            {
                var schedules = await _scheduleRepository.GetAllSchedulesAsync();
                var schedule = schedules.FirstOrDefault(s => s.Schedule_ID == id);
                
                if (schedule == null)
                    return NotFound(new { message = $"Schedule with ID {id} not found." });
                
                return Ok(schedule);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error retrieving schedule.", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateSchedule([FromBody] Schedule schedule)
        {
            if (schedule == null)
                return BadRequest(new { message = "Schedule data is required." });

            try
            {
                await _scheduleRepository.CreateScheduleAsync(schedule);
                return Ok(new { message = "Schedule created successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error creating schedule.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSchedule(string id, [FromBody] Schedule schedule)
        {
            if (schedule == null)
                return BadRequest(new { message = "Schedule data is required." });

            if (schedule.Schedule_ID != id)
                schedule.Schedule_ID = id;

            try
            {
                await _scheduleRepository.UpdateScheduleAsync(schedule);
                return Ok(new { message = "Schedule updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error updating schedule.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchedule(string id)
        {
            try
            {
                await _scheduleRepository.DeleteScheduleAsync(id);
                return Ok(new { message = "Schedule deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error deleting schedule.", error = ex.Message });
            }
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportSchedules([FromBody] List<BulkScheduleDto> schedules)
        {
            if (schedules == null || schedules.Count == 0)
                return BadRequest(new { message = "No schedules provided for import." });

            try
            {
                int successCount = await _scheduleRepository.BulkImportSchedulesAsync(schedules);
                return Ok(new { message = $"Successfully imported {successCount} schedules." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error during import.", error = ex.Message });
            }
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
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
            // Assuming you have a GetAllSchedulesAsync method in your repo
            // var schedules = await _scheduleRepository.GetAllSchedulesAsync();
            // return Ok(schedules);
            return Ok(); 
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
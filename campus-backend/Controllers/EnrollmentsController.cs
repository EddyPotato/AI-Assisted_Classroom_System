using Microsoft.AspNetCore.Mvc;
using campus_backend.Models;
using campus_backend.Repositories;

namespace campus_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnrollmentsController : ControllerBase
    {
        private readonly IEnrollmentRepository _enrollmentRepo;

        public EnrollmentsController(IEnrollmentRepository enrollmentRepo)
        {
            _enrollmentRepo = enrollmentRepo;
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> BulkEnrollRegularStudent([FromBody] BulkEnrollmentRequest req)
        {
            if (string.IsNullOrEmpty(req.Student_ID) || string.IsNullOrEmpty(req.Section_ID))
                return BadRequest(new { message = "Student ID and Section ID are required." });

            int rowsAffected = await _enrollmentRepo.BulkEnrollRegularStudentAsync(req);
            return Ok(new { message = $"Successfully assigned {rowsAffected} classes to regular student." });
        }

        [HttpPost("custom")]
        public async Task<IActionResult> CustomEnrollIrregularStudent([FromBody] CustomEnrollmentRequest req)
        {
            if (string.IsNullOrEmpty(req.Student_ID) || !req.Schedule_IDs.Any())
                return BadRequest(new { message = "Student ID and at least one Schedule ID are required." });

            int rowsAffected = await _enrollmentRepo.CustomEnrollIrregularStudentAsync(req);
            return Ok(new { message = $"Successfully enrolled in {rowsAffected} custom schedules." });
        }
    }
}
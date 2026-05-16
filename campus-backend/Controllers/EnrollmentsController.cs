using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
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

            // THE FIX: Enforce that Term_ID is provided by the frontend so the enrollment is semester-bound
            if (string.IsNullOrEmpty(req.Term_ID))
                return BadRequest(new { message = "Academic Term ID is required for enrollment." });

            int rowsAffected = await _enrollmentRepo.BulkEnrollRegularStudentAsync(req);
            
            if (rowsAffected == 0)
                return Ok(new { message = "Student is already enrolled in this section for the active term, or no new schedules were found." });

            return Ok(new { message = $"Successfully enrolled student for term {req.Term_ID}." });
        }

        [HttpPost("custom")]
        public async Task<IActionResult> CustomEnrollIrregularStudent([FromBody] CustomEnrollmentRequest req)
        {
            if (string.IsNullOrEmpty(req.Student_ID) || !req.Schedule_IDs.Any())
                return BadRequest(new { message = "Student ID and at least one Schedule ID are required." });

            // THE FIX: Enforce that Term_ID is provided
            if (string.IsNullOrEmpty(req.Term_ID))
                return BadRequest(new { message = "Academic Term ID is required for custom enrollment." });

            int rowsAffected = await _enrollmentRepo.CustomEnrollIrregularStudentAsync(req);
            return Ok(new { message = $"Successfully enrolled in {rowsAffected} custom schedules for term {req.Term_ID}." });
        }
    }
}
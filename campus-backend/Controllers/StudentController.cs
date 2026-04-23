using Microsoft.AspNetCore.Mvc;
using campus_backend.Models;
using campus_backend.Repositories;

namespace campus_backend.Controllers
{
    // This sets the base URL for this controller to: http://localhost:[port]/api/student
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly IStudentRepository _studentRepository;

        // Dependency Injection: The API automatically provides the repository we registered earlier
        public StudentController(IStudentRepository studentRepository)
        {
            _studentRepository = studentRepository;
        }

        // This creates an endpoint that looks like: GET /api/student/24-1507
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStudent(string id)
        {
            // 1. Ask the repository to run the Oracle SQL query
            var student = await _studentRepository.GetStudentByIdAsync(id);

            // 2. If the SQL query returns nothing, send a 404 Not Found error
            if (student == null)
            {
                return NotFound(new { message = $"No student found with ID: {id}" });
            }

            // 3. If found, send the student data back with a 200 OK status!
            return Ok(student);
        }
    }
}
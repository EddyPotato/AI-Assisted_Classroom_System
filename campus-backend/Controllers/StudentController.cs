using Microsoft.AspNetCore.Mvc;
using campus_backend.Models;
using campus_backend.Repositories;

namespace campus_backend.Controllers
{
    public class StudentRegistrationDto
    {
        public string Student_ID { get; set; } = string.Empty;
        public string First_Name { get; set; } = string.Empty;
        public string Middle_Name { get; set; } = string.Empty;
        public string Last_Name { get; set; } = string.Empty;
        public string Enrollment_Status { get; set; } = "Regular"; // NEW
        public IFormFile? Photo { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly IStudentRepository _studentRepository;

        public StudentController(IStudentRepository studentRepository)
        {
            _studentRepository = studentRepository;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetStudent(string id)
        {
            var student = await _studentRepository.GetStudentByIdAsync(id);
            if (student == null) return NotFound(new { message = $"No student found with ID: {id}" });
            return Ok(student);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllStudents()
        {
            try
            {
                var students = await _studentRepository.GetAllStudentsAsync();
                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database Error: " + ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> RegisterStudent([FromForm] StudentRegistrationDto dto)
        {
            try
            {
                if (dto.Photo == null || dto.Photo.Length == 0)
                {
                    return BadRequest(new { message = "Face reference photo is required." });
                }

                // Use the portable directory
                string directoryPath = Path.Combine(Directory.GetCurrentDirectory(), "ReferenceFaces");
                string cleanLastName = dto.Last_Name.Replace(" ", "").ToLower();
                string fileName = $"{cleanLastName}_{dto.Student_ID}_face.jpg";
                string fullPath = Path.Combine(directoryPath, fileName);

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await dto.Photo.CopyToAsync(stream);
                }

                // Save ONLY the filename to the database (e.g., "rodriguez_24-1507_face.jpg")
                var newStudent = new Student
                {
                    Student_ID = dto.Student_ID,
                    First_Name = dto.First_Name,
                    Middle_Name = dto.Middle_Name,
                    Last_Name = dto.Last_Name,
                    Enrollment_Status = dto.Enrollment_Status,
                    Face_Reference_Path = fileName // Store just the name!
                };

                await _studentRepository.CreateStudentAsync(newStudent);

                return Ok(new { message = "Student registered and face data saved successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to register: " + ex.Message });
            }
        }
    }
}
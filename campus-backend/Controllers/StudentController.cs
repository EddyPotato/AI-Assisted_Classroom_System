using Microsoft.AspNetCore.Mvc;
using campus_backend.Models;
using campus_backend.Repositories;

namespace campus_backend.Controllers
{
    // DTO to handle incoming Multipart Form Data (Text + File)
    public class StudentRegistrationDto
    {
        public string Student_ID { get; set; } = string.Empty;
        public string First_Name { get; set; } = string.Empty;
        public string Middle_Name { get; set; } = string.Empty;
        public string Last_Name { get; set; } = string.Empty;
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

        // --- NEW: GET ALL STUDENTS ---
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

        // --- NEW: REGISTER STUDENT & SAVE FACE DATA ---
        [HttpPost]
        public async Task<IActionResult> RegisterStudent([FromForm] StudentRegistrationDto dto)
        {
            try
            {
                if (dto.Photo == null || dto.Photo.Length == 0)
                {
                    return BadRequest(new { message = "Face reference photo is required." });
                }

                // 1. Setup the Local Directory
                string directoryPath = @"C:\CampusSystem\ReferenceFaces";
                if (!Directory.Exists(directoryPath))
                {
                    Directory.CreateDirectory(directoryPath);
                }

                // 2. Format the Filename: e.g., rodriguez_24-1507_face.jpg
                string cleanLastName = dto.Last_Name.Replace(" ", "").ToLower();
                string fileName = $"{cleanLastName}_{dto.Student_ID}_face.jpg";
                string fullPath = Path.Combine(directoryPath, fileName);

                // 3. Save the actual file to the C: Drive
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await dto.Photo.CopyToAsync(stream);
                }

                // 4. Save the string path to Oracle Database
                var newStudent = new Student
                {
                    Student_ID = dto.Student_ID,
                    First_Name = dto.First_Name,
                    Middle_Name = dto.Middle_Name,
                    Last_Name = dto.Last_Name,
                    Face_Reference_Path = fullPath
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
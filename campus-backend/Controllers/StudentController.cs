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
        public string Enrollment_Status { get; set; } = "Regular";
        public IFormFile? Photo { get; set; }
    }

    // NEW: DTO for updating (ID is in the URL, not the body)
    public class StudentUpdateDto
    {
        public string First_Name { get; set; } = string.Empty;
        public string Middle_Name { get; set; } = string.Empty;
        public string Last_Name { get; set; } = string.Empty;
        public string Enrollment_Status { get; set; } = "Regular";
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
                    return BadRequest(new { message = "Face reference photo is required for new enrollments." });

                string directoryPath = Path.Combine(Directory.GetCurrentDirectory(), "ReferenceFaces");
                string cleanLastName = dto.Last_Name.Replace(" ", "").ToLower();
                string fileName = $"{cleanLastName}_{dto.Student_ID}_face.jpg";
                string fullPath = Path.Combine(directoryPath, fileName);

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await dto.Photo.CopyToAsync(stream);
                }

                var newStudent = new Student
                {
                    Student_ID = dto.Student_ID,
                    First_Name = dto.First_Name,
                    Middle_Name = dto.Middle_Name,
                    Last_Name = dto.Last_Name,
                    Enrollment_Status = dto.Enrollment_Status,
                    Face_Reference_Path = fileName 
                };

                await _studentRepository.CreateStudentAsync(newStudent);
                return Ok(new { message = "Student registered and face data saved successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to register: " + ex.Message });
            }
        }

        // --- NEW: EDIT STUDENT ENDPOINT ---
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStudent(string id, [FromForm] StudentUpdateDto dto)
        {
            try
            {
                var existingStudent = await _studentRepository.GetStudentByIdAsync(id);
                if (existingStudent == null) return NotFound(new { message = "Student not found." });

                // Keep existing photo by default
                string newFacePath = existingStudent.Face_Reference_Path; 

                // If user took a NEW photo, overwrite it in the C: drive
                if (dto.Photo != null && dto.Photo.Length > 0)
                {
                    string directoryPath = Path.Combine(Directory.GetCurrentDirectory(), "ReferenceFaces");
                    string cleanLastName = dto.Last_Name.Replace(" ", "").ToLower();
                    string fileName = $"{cleanLastName}_{id}_face.jpg";
                    string fullPath = Path.Combine(directoryPath, fileName);

                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        await dto.Photo.CopyToAsync(stream);
                    }
                    newFacePath = fileName; // Update path
                }

                var updatedStudent = new Student
                {
                    Student_ID = id,
                    First_Name = dto.First_Name,
                    Middle_Name = dto.Middle_Name,
                    Last_Name = dto.Last_Name,
                    Enrollment_Status = dto.Enrollment_Status,
                    Face_Reference_Path = newFacePath
                };

                await _studentRepository.UpdateStudentAsync(updatedStudent);
                return Ok(new { message = "Student profile updated successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update: " + ex.Message });
            }
        }

        // --- NEW: DELETE STUDENT ENDPOINT ---
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudent(string id)
        {
            await _studentRepository.DeleteStudentAsync(id);
            return Ok(new { message = "Student deleted successfully!" });
        }
    }
}
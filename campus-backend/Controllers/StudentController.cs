using Microsoft.AspNetCore.Mvc;
using campus_backend.Models;
using campus_backend.Repositories;

namespace campus_backend.Controllers
{
    public class StudentRegistrationDto
    {
        public string? Student_ID { get; set; } 
        public string First_Name { get; set; } = string.Empty;
        public string? Middle_Name { get; set; } // MADE NULLABLE
        public string Last_Name { get; set; } = string.Empty;
        public string Enrollment_Status { get; set; } = "Regular";
        public IFormFile? Photo { get; set; }
        
        // NEW FIELDS MADE NULLABLE
        public string? Contact_Number { get; set; }
        public string? Birthday { get; set; }
        public string? Address { get; set; }
    }

    public class StudentUpdateDto
    {
        public string First_Name { get; set; } = string.Empty;
        public string? Middle_Name { get; set; } // MADE NULLABLE
        public string Last_Name { get; set; } = string.Empty;
        public string Enrollment_Status { get; set; } = "Regular";
        public IFormFile? Photo { get; set; }

        // NEW FIELDS MADE NULLABLE
        public string? Contact_Number { get; set; }
        public string? Birthday { get; set; }
        public string? Address { get; set; }
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

                // --- HYBRID ID GENERATOR LOGIC ---
                string finalStudentId = dto.Student_ID ?? string.Empty;
                
                if (string.IsNullOrWhiteSpace(finalStudentId))
                {
                    string currentYearPrefix = DateTime.Now.ToString("yy"); // e.g. "26"
                    string? latestId = await _studentRepository.GetLatestStudentIdAsync(currentYearPrefix);

                    if (string.IsNullOrEmpty(latestId))
                    {
                        finalStudentId = $"{currentYearPrefix}-0001";
                    }
                    else
                    {
                        string[] parts = latestId.Split('-');
                        if (parts.Length == 2 && int.TryParse(parts[1], out int currentNumber))
                        {
                            finalStudentId = $"{currentYearPrefix}-{(currentNumber + 1).ToString("D4")}";
                        }
                        else
                        {
                            finalStudentId = $"{currentYearPrefix}-0001"; // Fallback
                        }
                    }
                }

                // File saving logic
                string directoryPath = Path.Combine(Directory.GetCurrentDirectory(), "ReferenceFaces");
                string cleanLastName = dto.Last_Name.Replace(" ", "").ToLower();
                string fileName = $"{cleanLastName}_{finalStudentId}_face.jpg";
                string fullPath = Path.Combine(directoryPath, fileName);

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await dto.Photo.CopyToAsync(stream);
                }

                var newStudent = new Student
                {
                    Student_ID = finalStudentId,
                    First_Name = dto.First_Name,
                    Middle_Name = dto.Middle_Name,
                    Last_Name = dto.Last_Name,
                    Enrollment_Status = dto.Enrollment_Status,
                    Face_Reference_Path = fileName,
                    
                    // THE FIX: Pass the new data from the DTO to the Model!
                    Contact_Number = dto.Contact_Number,
                    Birthday = dto.Birthday,
                    Address = dto.Address 
                };

                await _studentRepository.CreateStudentAsync(newStudent);
                // Inside RegisterStudent, change the return statement to this:
                return Ok(new { 
                    message = "Student registered and face data saved successfully!",
                    assignedId = finalStudentId // Sending the ID back to React!
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to register: " + ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStudent(string id, [FromForm] StudentUpdateDto dto)
        {
            try
            {
                var existingStudent = await _studentRepository.GetStudentByIdAsync(id);
                if (existingStudent == null) return NotFound(new { message = "Student not found." });

                string newFacePath = existingStudent.Face_Reference_Path; 

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
                    newFacePath = fileName;
                }

                var updatedStudent = new Student
                {
                    Student_ID = id,
                    First_Name = dto.First_Name,
                    Middle_Name = dto.Middle_Name,
                    Last_Name = dto.Last_Name,
                    Enrollment_Status = dto.Enrollment_Status,
                    Face_Reference_Path = newFacePath,
                    
                    // THE FIX: Pass the new data from the DTO to the Model!
                    Contact_Number = dto.Contact_Number,
                    Birthday = dto.Birthday,
                    Address = dto.Address
                };

                await _studentRepository.UpdateStudentAsync(updatedStudent);
                return Ok(new { message = "Student profile updated successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update: " + ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudent(string id)
        {
            await _studentRepository.DeleteStudentAsync(id);
            return Ok(new { message = "Student marked as dropped successfully!" });
        }
    }
}
using campus_backend.Models;
using campus_backend.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace campus_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly ICourseRepository _repo;

        public CoursesController(ICourseRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _repo.GetAllCoursesAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var course = await _repo.GetCourseByIdAsync(id);
            return course == null ? NotFound() : Ok(course);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Course course)
        {
            if (string.IsNullOrWhiteSpace(course.Course_Code) || string.IsNullOrWhiteSpace(course.Course_Name))
                return BadRequest("Course Code and Name are required.");

            try
            {
                var success = await _repo.CreateCourseAsync(course);
                return success ? CreatedAtAction(nameof(GetById), new { id = course.Course_Code }, course) : BadRequest("Failed to create course.");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message} - Course Code might already exist.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Course course)
        {
            if (id != course.Course_Code) return BadRequest("ID mismatch.");
            var success = await _repo.UpdateCourseAsync(course);
            return success ? Ok(course) : NotFound("Course not found.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _repo.DeleteCourseAsync(id);
            return success ? Ok() : BadRequest("Failed to delete course.");
        }
    }
}
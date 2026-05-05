using Microsoft.AspNetCore.Mvc;
using campus_backend.Models;
using campus_backend.Repositories;

namespace campus_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SectionsController : ControllerBase
    {
        private readonly ISectionRepository _sectionRepository;

        public SectionsController(ISectionRepository sectionRepository)
        {
            _sectionRepository = sectionRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSections()
        {
            var sections = await _sectionRepository.GetAllSectionsAsync();
            return Ok(sections);
        }

        [HttpGet("{id}/students")]
        public async Task<IActionResult> GetStudentsInSection(string id)
        {
            var students = await _sectionRepository.GetStudentsInSectionAsync(id);
            return Ok(students);
        }

        [HttpPost("{id}/students")]
        public async Task<IActionResult> AddStudentsToSection(string id, [FromBody] List<string> studentIds)
        {
            await _sectionRepository.AddStudentsToSectionAsync(id, studentIds);
            return Ok(new { message = "Students added successfully" });
        }

        [HttpDelete("{sectionId}/students/{studentId}")]
        public async Task<IActionResult> RemoveStudent(string sectionId, string studentId)
        {
            await _sectionRepository.RemoveStudentFromSectionAsync(sectionId, studentId);
            return Ok(new { message = "Student removed successfully" });
        }

        [HttpGet("{id}/schedule")]
        public async Task<IActionResult> GetSectionSchedule(string id)
        {
            var schedule = await _sectionRepository.GetSectionScheduleAsync(id);
            return Ok(schedule);
        }
    }
}
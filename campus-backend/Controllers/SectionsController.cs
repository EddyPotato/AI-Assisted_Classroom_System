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

        [HttpPost]
        public async Task<IActionResult> CreateSection([FromBody] SectionDTO section)
        {
            if (string.IsNullOrWhiteSpace(section.Section_Name) || string.IsNullOrWhiteSpace(section.Course))
            {
                return BadRequest(new { message = "Section name and course are required" });
            }

            var createdSection = await _sectionRepository.CreateSectionAsync(section);
            return CreatedAtAction(nameof(GetAllSections), new { id = createdSection.Section_ID }, createdSection);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSection(string id, [FromBody] SectionDTO section)
        {
            if (string.IsNullOrWhiteSpace(section.Section_Name) || string.IsNullOrWhiteSpace(section.Course))
            {
                return BadRequest(new { message = "Section name and course are required" });
            }

            var updatedSection = await _sectionRepository.UpdateSectionAsync(id, section);
            return Ok(updatedSection);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSection(string id)
        {
            await _sectionRepository.DeleteSectionAsync(id);
            return Ok(new { message = "Section deleted successfully" });
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
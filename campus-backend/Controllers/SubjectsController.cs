using campus_backend.Models;
using campus_backend.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace campus_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubjectsController : ControllerBase
    {
        private readonly ISubjectRepository _repo;

        public SubjectsController(ISubjectRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _repo.GetAllSubjectsAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var subject = await _repo.GetSubjectByIdAsync(id);
            return subject == null ? NotFound() : Ok(subject);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Subject subject)
        {
            if (string.IsNullOrWhiteSpace(subject.Subject_Code) || string.IsNullOrWhiteSpace(subject.Title))
                return BadRequest("Subject Code and Title are required.");

            try
            {
                var success = await _repo.CreateSubjectAsync(subject);
                return success ? CreatedAtAction(nameof(GetById), new { id = subject.Subject_Code }, subject) : BadRequest("Failed to create subject.");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message} - Subject Code might already exist.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Subject subject)
        {
            if (id != subject.Subject_Code) return BadRequest("ID mismatch.");
            var success = await _repo.UpdateSubjectAsync(subject);
            return success ? Ok(subject) : NotFound("Subject not found.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _repo.DeleteSubjectAsync(id);
            return success ? Ok() : BadRequest("Failed to delete subject. It might be assigned to a schedule.");
        }
    }
}
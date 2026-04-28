using Microsoft.AspNetCore.Mvc;
using campus_backend.Models;
using campus_backend.Repositories;

namespace campus_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfessorController : ControllerBase
    {
        private readonly IProfessorRepository _professorRepository;

        public ProfessorController(IProfessorRepository professorRepository)
        {
            _professorRepository = professorRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProfessors()
        {
            try
            {
                var professors = await _professorRepository.GetAllProfessorsAsync();
                return Ok(professors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database Error: " + ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProfessor(string id)
        {
            var professor = await _professorRepository.GetProfessorByIdAsync(id);
            if (professor == null) return NotFound(new { message = $"No professor found with ID: {id}" });
            return Ok(professor);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProfessor([FromBody] Professor dto)
        {
            try
            {
                await _professorRepository.CreateProfessorAsync(dto);
                return Ok(new { message = "Professor registered successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to register: " + ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfessor(string id, [FromBody] Professor dto)
        {
            try
            {
                var existing = await _professorRepository.GetProfessorByIdAsync(id);
                if (existing == null) return NotFound(new { message = "Professor not found." });

                dto.Professor_ID = id; // Ensure ID matches URL
                await _professorRepository.UpdateProfessorAsync(dto);
                return Ok(new { message = "Professor updated successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update: " + ex.Message });
            }
        }
    }
}
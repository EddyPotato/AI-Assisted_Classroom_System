using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using campus_backend.Models;
using campus_backend.Repositories;

namespace campus_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TermsController : ControllerBase
    {
        private readonly IAcademicTermRepository _termRepo;

        public TermsController(IAcademicTermRepository termRepo)
        {
            _termRepo = termRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTerms()
        {
            try
            {
                var terms = await _termRepo.GetAllTermsAsync();
                return Ok(terms);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error fetching terms: {ex.Message}");
                return StatusCode(500, new { message = "Database error retrieving academic terms.", error = ex.Message });
            }
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveTerm()
        {
            try
            {
                var term = await _termRepo.GetActiveTermAsync();
                if (term == null) 
                    return NotFound(new { message = "No active academic term found." });
                
                return Ok(term);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error fetching active term: {ex.Message}");
                return StatusCode(500, new { message = "Database error retrieving active term.", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateTerm([FromBody] AcademicTerm term)
        {
            if (string.IsNullOrWhiteSpace(term.Term_ID) || string.IsNullOrWhiteSpace(term.School_Year))
                return BadRequest(new { message = "Term ID and School Year are required." });

            try
            {
                await _termRepo.CreateTermAsync(term);
                return Ok(new { message = "Academic term created successfully." });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error creating term: {ex.Message}");
                return StatusCode(500, new { message = "Database error creating academic term.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTerm(string id, [FromBody] AcademicTerm term)
        {
            if (term.Term_ID != id)
                term.Term_ID = id;

            try
            {
                await _termRepo.UpdateTermAsync(term);
                return Ok(new { message = "Academic term updated successfully." });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error updating term: {ex.Message}");
                return StatusCode(500, new { message = "Database error updating academic term.", error = ex.Message });
            }
        }

        [HttpPut("{id}/activate")]
        public async Task<IActionResult> ActivateTerm(string id)
        {
            try
            {
                await _termRepo.SetTermActiveAsync(id);
                return Ok(new { message = $"Term {id} has been set as active system-wide." });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error activating term: {ex.Message}");
                return StatusCode(500, new { message = "Database error activating academic term.", error = ex.Message });
            }
        }
    }
}
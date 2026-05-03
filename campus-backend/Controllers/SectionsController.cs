using Microsoft.AspNetCore.Mvc;
using campus_backend.Models;
using campus_backend.Repositories;

namespace campus_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SectionsController : ControllerBase
    {
        private readonly ISectionRepository _sectionRepo;

        public SectionsController(ISectionRepository sectionRepo)
        {
            _sectionRepo = sectionRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSections() => Ok(await _sectionRepo.GetAllSectionsAsync());

        [HttpGet("{id}/students")]
        public async Task<IActionResult> GetSectionRoster(string id) => Ok(await _sectionRepo.GetSectionRosterAsync(id));

        [HttpPost]
        public async Task<IActionResult> CreateSection([FromBody] Section section)
        {
            await _sectionRepo.CreateSectionAsync(section);
            return Ok(new { message = "Section created successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSection(string id)
        {
            await _sectionRepo.DeleteSectionAsync(id);
            return Ok(new { message = "Section deleted successfully" });
        }
    }
}
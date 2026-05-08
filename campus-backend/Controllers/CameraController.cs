using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using campus_backend.Models;
using campus_backend.Repositories;

namespace campus_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CameraController : ControllerBase
    {
        private readonly ICameraLocationRepository _locationRepo;

        public CameraController(ICameraLocationRepository locationRepo)
        {
            _locationRepo = locationRepo;
        }

        [HttpGet("locations")]
        public async Task<IActionResult> GetLocations()
        {
            var locations = await _locationRepo.GetAllActiveLocationsAsync();
            return Ok(locations);
        }

        [HttpPost("locations")]
        public async Task<IActionResult> CreateLocation([FromBody] CameraLocation location)
        {
            var success = await _locationRepo.CreateLocationAsync(location);
            if (success) return CreatedAtAction(nameof(GetLocations), new { id = location.Location_ID }, location);
            return BadRequest("Failed to create camera location.");
        }

        [HttpPut("locations/{id}")]
        public async Task<IActionResult> UpdateLocation(string id, [FromBody] CameraLocation location)
        {
            var success = await _locationRepo.UpdateLocationAsync(id, location);
            if (success) return Ok();
            return NotFound("Camera location not found.");
        }

        [HttpDelete("locations/{id}")]
        public async Task<IActionResult> DeleteLocation(string id)
        {
            // Ensure your ICameraLocationRepository has a DeleteLocationAsync method!
            var success = await _locationRepo.DeleteLocationAsync(id);
            if (success) return Ok();
            return BadRequest("Failed to delete location.");
        }
    }
}
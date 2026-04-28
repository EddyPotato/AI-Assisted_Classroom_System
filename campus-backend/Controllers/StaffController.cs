using Microsoft.AspNetCore.Mvc;
using campus_backend.Models;
using campus_backend.Repositories;

namespace campus_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController : ControllerBase
    {
        private readonly IStaffRepository _staffRepo;
        public StaffController(IStaffRepository staffRepo) { _staffRepo = staffRepo; }

        [HttpGet]
        public async Task<IActionResult> GetAllStaff() => Ok(await _staffRepo.GetAllStaffAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetStaff(string id)
        {
            var staff = await _staffRepo.GetStaffByIdAsync(id);
            if (staff == null) return NotFound(new { message = "Staff not found" });
            return Ok(staff);
        }

        [HttpPost]
        public async Task<IActionResult> CreateStaff([FromBody] Staff dto)
        {
            await _staffRepo.CreateStaffAsync(dto);
            return Ok(new { message = "Staff registered successfully!" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStaff(string id, [FromBody] Staff dto)
        {
            dto.User_ID = id; 
            await _staffRepo.UpdateStaffAsync(dto);
            return Ok(new { message = "Staff updated successfully!" });
        }
    }
}
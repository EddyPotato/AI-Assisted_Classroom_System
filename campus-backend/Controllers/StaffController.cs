using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.IO;
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
        public async Task<IActionResult> CreateStaff([FromForm] Staff dto, IFormFile? Photo)
        {
            if (Photo != null && Photo.Length > 0)
            {
                string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "ReferenceFaces");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                string uniqueFileName = $"{dto.Last_Name?.ToLower()}_{dto.User_ID}_staff_face.jpg";
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);
                
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await Photo.CopyToAsync(fileStream);
                }
                dto.Face_Reference_Path = uniqueFileName;
            }

            await _staffRepo.CreateStaffAsync(dto);
            return Ok(new { message = "Staff registered successfully!" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStaff(string id, [FromForm] Staff dto, IFormFile? Photo)
        {
            dto.User_ID = id; 
            
            if (Photo != null && Photo.Length > 0)
            {
                string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "ReferenceFaces");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                string uniqueFileName = $"{dto.Last_Name?.ToLower()}_{dto.User_ID}_staff_face.jpg";
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);
                
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await Photo.CopyToAsync(fileStream);
                }
                dto.Face_Reference_Path = uniqueFileName;
            }

            await _staffRepo.UpdateStaffAsync(dto);
            return Ok(new { message = "Staff updated successfully!" });
        }

        // --- DELETE STAFF MEMBER ---
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStaff(string id)
        {
            await _staffRepo.DeleteStaffAsync(id);
            return Ok(new { message = "Staff deleted successfully!" });
        }
    }
}
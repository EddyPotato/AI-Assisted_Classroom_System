using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using campus_backend.Models;
using campus_backend.Repositories;
using campus_backend.Services;

namespace campus_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController : ControllerBase
    {
        private readonly IStaffRepository _staffRepo;
        private readonly IImageUploadService _imageService;

        public StaffController(IStaffRepository staffRepo, IImageUploadService imageService) 
        { 
            _staffRepo = staffRepo; 
            _imageService = imageService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllStaff() => Ok(await _staffRepo.GetAllStaffAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetStaff(string id)
        {
            var staff = await _staffRepo.GetStaffByIdAsync(id);
            return staff == null ? NotFound(new { message = "Staff not found" }) : Ok(staff);
        }

        [HttpPost]
        public async Task<IActionResult> CreateStaff([FromForm] Staff dto, IFormFile? Photo)
        {
            if (Photo != null)
            {
                dto.Face_Reference_Path = await _imageService.UploadFaceReferenceAsync(Photo, dto.Last_Name, dto.User_ID, "staff_face.jpg");
            }

            await _staffRepo.CreateStaffAsync(dto);
            return Ok(new { message = "Staff registered successfully!" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStaff(string id, [FromForm] Staff dto, IFormFile? Photo)
        {
            dto.User_ID = id; 
            
            if (Photo != null)
            {
                dto.Face_Reference_Path = await _imageService.UploadFaceReferenceAsync(Photo, dto.Last_Name, dto.User_ID, "staff_face.jpg");
            }

            await _staffRepo.UpdateStaffAsync(dto);
            return Ok(new { message = "Staff updated successfully!" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStaff(string id)
        {
            await _staffRepo.DeleteStaffAsync(id);
            return Ok(new { message = "Staff deleted successfully!" });
        }
    }
}
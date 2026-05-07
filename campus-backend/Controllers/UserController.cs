using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;
using campus_backend.Models;
using campus_backend.Repositories;
using campus_backend.Services;

namespace campus_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IImageUploadService _imageService;

        public UserController(IUserRepository userRepository, IImageUploadService imageService)
        {
            _userRepository = userRepository;
            _imageService = imageService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers() => Ok(await _userRepository.GetAllUsersAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            return user == null ? NotFound() : Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromForm] User user, IFormFile? Photo)
        {
            if (string.IsNullOrEmpty(user.User_ID))
            {
                Random rnd = new Random();
                user.User_ID = "USR-" + rnd.Next(1000, 9999).ToString(); 
            }

            if (Photo != null)
            {
                user.Face_Reference_Path = await _imageService.UploadFaceReferenceAsync(Photo, user.Last_Name, user.User_ID, "staff_face.jpg");
            }

            await _userRepository.CreateUserAsync(user);
            return CreatedAtAction(nameof(GetUserById), new { id = user.User_ID }, user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromForm] User user, IFormFile? Photo)
        {
            var existingUser = await _userRepository.GetUserByIdAsync(id);
            if (existingUser == null) return NotFound("User not found.");

            if (Photo != null)
            {
                user.Face_Reference_Path = await _imageService.UploadFaceReferenceAsync(Photo, user.Last_Name, user.User_ID, "staff_face.jpg");
            }

            await _userRepository.UpdateUserAsync(user);
            return Ok(new { message = "User updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            await _userRepository.DeleteUserAsync(id);
            return Ok(new { message = "User deleted successfully" });
        }
    }
}
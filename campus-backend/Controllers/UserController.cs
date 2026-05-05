using Microsoft.AspNetCore.Mvc;
using campus_backend.Models;
using campus_backend.Repositories;

namespace campus_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UserController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userRepository.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPost]
        // THE FIX: Changed from [FromBody] to [FromForm] to support Image Uploads
        public async Task<IActionResult> CreateUser([FromForm] User user, IFormFile? Photo)
        {
            if (string.IsNullOrEmpty(user.User_ID))
            {
                Random rnd = new Random();
                user.User_ID = "USR-" + rnd.Next(1000, 9999).ToString(); 
            }

            // Image Save Logic
            if (Photo != null && Photo.Length > 0)
            {
                string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "ReferenceFaces");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                string uniqueFileName = $"{user.Last_Name.ToLower()}_{user.User_ID}_staff_face.jpg";
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);
                
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await Photo.CopyToAsync(fileStream);
                }
                user.Face_Reference_Path = uniqueFileName;
            }
            
            await _userRepository.CreateUserAsync(user);
            return Ok(new { message = "User created successfully", assignedId = user.User_ID });
        }

        [HttpPut("{id}")]
        // THE FIX: Changed from [FromBody] to [FromForm] to support Image Updating and Soft Deletes
        public async Task<IActionResult> UpdateUser(string id, [FromForm] User user, IFormFile? Photo)
        {
            // Sync the ID from the URL to the model just to be safe
            user.User_ID = id;

            var existingUser = await _userRepository.GetUserByIdAsync(id);
            if (existingUser == null) return NotFound("User not found.");

            // Image Update Logic
            if (Photo != null && Photo.Length > 0)
            {
                string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "ReferenceFaces");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                string uniqueFileName = $"{user.Last_Name.ToLower()}_{user.User_ID}_staff_face.jpg";
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);
                
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await Photo.CopyToAsync(fileStream);
                }
                user.Face_Reference_Path = uniqueFileName;
            }

            await _userRepository.UpdateUserAsync(user);
            return Ok(new { message = "User updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var existingUser = await _userRepository.GetUserByIdAsync(id);
            if (existingUser == null) return NotFound();

            // Note: This triggers the HARD DELETE in the repository
            await _userRepository.DeleteUserAsync(id);
            return Ok(new { message = "User deleted successfully" });
        }
    }
}
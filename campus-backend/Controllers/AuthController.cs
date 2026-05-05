using Microsoft.AspNetCore.Mvc;
using campus_backend.Models;
using campus_backend.Repositories;

namespace campus_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public AuthController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // 1. Validate incoming request
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "User ID and Password are required." });
            }

            // 2. Fetch the user from the database
            var user = await _userRepository.GetUserByIdAsync(request.Username);
            
            if (user == null) 
            {
                return Unauthorized(new { message = "Invalid User ID or Password." });
            }

            // THE FIX: 3. Prevent BCrypt from crashing if the database password is null/empty
            if (string.IsNullOrEmpty(user.Password))
            {
                return Unauthorized(new { message = "This account has no password set. Please contact the administrator." });
            }

            // 4. Handle Legacy Plaintext Passwords (auto-hashes them for future logins)
            if (user.Password == request.Password)
            {
                var newHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
                await _userRepository.UpdatePasswordAsync(user.User_ID!, newHash);
                user.Password = newHash; 
            }
            else
            {
                // 5. Standard BCrypt Verification
                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
                if (!isPasswordValid) 
                {
                    return Unauthorized(new { message = "Invalid User ID or Password." });
                }
            }

            // 6. Scrub password before sending to React for security
            user.Password = null; 

            // Notice we are now returning the Role to the frontend!
            return Ok(new { message = "Login successful", user = user });
        }
    }
}
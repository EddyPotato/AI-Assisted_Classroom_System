using Microsoft.AspNetCore.Mvc;
using campus_backend.Models;
using campus_backend.Repositories;

namespace campus_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IProfessorRepository _professorRepository;

        public AuthController(IProfessorRepository professorRepository)
        {
            _professorRepository = professorRepository;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Professor ID and Password are required." });
            }

            var professor = await _professorRepository.GetProfessorByIdAsync(request.Username);
            if (professor == null) return Unauthorized(new { message = "Invalid Professor ID or Password." });

            // --- PASSWORD HASH UPGRADE LOGIC ---
            // Detects if the password in the database is the exact plain text (first login ever)
            if (professor.Password == request.Password)
            {
                // Hash it and update the DB immediately so it is never plain text again
                var newHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
                await _professorRepository.UpdatePasswordAsync(professor.Professor_ID!, newHash);
                professor.Password = newHash; 
            }
            else
            {
                // Standard BCrypt mathematical verification
                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, professor.Password);
                if (!isPasswordValid) return Unauthorized(new { message = "Invalid Professor ID or Password." });
            }

            // Scrub the password from the object before sending it to the React UI
            professor.Password = null;

            return Ok(new { message = "Login successful", user = professor });
        }
    }
}
namespace campus_backend.Models
{
    public class LoginRequest
    {
        public string? Username { get; set; } // This will be the Professor ID
        public string? Password { get; set; }
    }
}
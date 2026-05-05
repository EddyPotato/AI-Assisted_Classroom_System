namespace campus_backend.Models
{
    public class User
    {
        public string User_ID { get; set; } = string.Empty;
        public string First_Name { get; set; } = string.Empty;
        public string? Middle_Name { get; set; }
        public string Last_Name { get; set; } = string.Empty;
        public string? Password { get; set; } 
        public string Role { get; set; } = string.Empty;
    }
}
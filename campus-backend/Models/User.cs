namespace campus_backend.Models
{
    public class User
    {
        public string? User_ID { get; set; }
        public string? First_Name { get; set; }
        public string? Middle_Name { get; set; } // Added Middle Name
        public string? Last_Name { get; set; }
        public string? Password { get; set; }
        public string? Role { get; set; } 
    }
}
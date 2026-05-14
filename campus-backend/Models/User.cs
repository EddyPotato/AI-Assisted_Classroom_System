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
        
        public string? Email { get; set; }
        public string? Contact_Number { get; set; }
        public string? Address { get; set; }
        public string Status { get; set; } = "Active"; 
        public string? Face_Reference_Path { get; set; }
        public int Lates_Count { get; set; } = 0; // Tracking tardiness
    }
}
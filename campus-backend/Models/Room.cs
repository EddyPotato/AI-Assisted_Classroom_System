namespace campus_backend.Models
{
    public class Room
    {
        public string? Room_ID { get; set; }
        public string? Room_Name { get; set; }
        public string? Room_Type { get; set; }
        public int Capacity { get; set; }
        public string? Status { get; set; }
        public string? Assigned_Faculty_ID { get; set; }
        
        // This holds the joined name from the Users table so React doesn't have to look it up!
        public string? Faculty_Name { get; set; } 
    }
}
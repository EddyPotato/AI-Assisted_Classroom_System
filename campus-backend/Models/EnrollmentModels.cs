namespace campus_backend.Models
{
    public class RosterStudent
    {
        public string? Student_ID { get; set; }
        public string? First_Name { get; set; }
        public string? Last_Name { get; set; }
        public string? Enrollment_Status { get; set; }
    }

    public class BulkEnrollmentRequest
    {
        public string? Student_ID { get; set; }
        public string? Section_ID { get; set; }
    }

    public class CustomEnrollmentRequest
    {
        public string? Student_ID { get; set; }
        public List<string> Schedule_IDs { get; set; } = new List<string>();
    }
}
namespace campus_backend.Models
{
    // New Model for the MIS to manage terms
    public class AcademicTerm
    {
        public string? Term_ID { get; set; }
        public string? School_Year { get; set; }
        public string? Semester { get; set; }
        public bool Is_Active { get; set; }
        public DateTime? Start_Date { get; set; }
        public DateTime? End_Date { get; set; }
    }

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
        public string? Term_ID { get; set; } // Added
    }

    public class CustomEnrollmentRequest
    {
        public string? Student_ID { get; set; }
        public string? Term_ID { get; set; } // Added
        public List<string> Schedule_IDs { get; set; } = new List<string>();
    }
}
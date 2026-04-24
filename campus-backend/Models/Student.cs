namespace campus_backend.Models
{
    public class Student
    {
        public string Student_ID { get; set; } = string.Empty;
        public string First_Name { get; set; } = string.Empty;
        public string Middle_Name { get; set; } = string.Empty;
        public string Last_Name { get; set; } = string.Empty;
        public string Face_Reference_Path { get; set; } = string.Empty;
        public string Enrollment_Status { get; set; } = "Regular"; // NEW
    }
}
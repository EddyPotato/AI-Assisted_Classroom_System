namespace campus_backend.Models
{
    public class Professor
    {
        public string Professor_ID { get; set; } = string.Empty;
        public string First_Name { get; set; } = string.Empty;
        public string Last_Name { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        // You can add Face_Reference_Path later when we attach the camera!
    }
}
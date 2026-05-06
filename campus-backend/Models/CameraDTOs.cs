namespace campus_backend.Models
{
    public class ManualScanRequest
    {
        public string Student_Id { get; set; }
        public string Camera_Location_Id { get; set; }
        public string Bypass_Reason { get; set; } // Optional: For actual bypasses without ID
    }

    public class CameraStateRequest
    {
        public string Camera_Location_Id { get; set; }
    }
}
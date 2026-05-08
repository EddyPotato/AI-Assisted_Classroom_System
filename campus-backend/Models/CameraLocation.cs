namespace campus_backend.Models
{
    public class CameraLocation
    {
        public string Location_ID { get; set; } = string.Empty;
        public string Camera_Name { get; set; } = string.Empty;
        public string Logic_Type { get; set; } = string.Empty;
        public string Location_Type { get; set; } = string.Empty;
        
        public string? Associated_Room_ID { get; set; }
        
        // 👇 THE FIX: Add the '?' here to make it nullable so ASP.NET stops rejecting the payload!
        public string? Status_On_Scan { get; set; } 
        
        public bool Is_Active { get; set; }
    }
}
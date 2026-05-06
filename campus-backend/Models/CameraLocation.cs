using System;

namespace campus_backend.Models
{
    public class CameraLocation
    {
        public string Location_ID { get; set; }
        public string Camera_Name { get; set; }
        public string Logic_Type { get; set; } // NEW: gate or room
        public string Location_Type { get; set; } // entrance or exit
        public string Associated_Room_ID { get; set; }
        public string Status_On_Scan { get; set; } 
        public bool Is_Active { get; set; }
        public DateTime Created_At { get; set; }
    }
}
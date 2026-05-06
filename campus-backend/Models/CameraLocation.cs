using System;

namespace campus_backend.Models
{
    public class CameraLocation
    {
        public string Location_ID { get; set; }
        public string Camera_Name { get; set; }
        public string Location_Type { get; set; } // Entrance, Exit, Room
        public string Associated_Room_ID { get; set; }
        public string Status_On_Scan { get; set; } // in-campus, offline, present-in-room
        public bool Is_Active { get; set; }
        public DateTime Created_At { get; set; }
    }
}
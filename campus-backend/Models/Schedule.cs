namespace campus_backend.Models
{
    public class Schedule
    {
        public string? Schedule_ID { get; set; }
        public string? Term_ID { get; set; } // Added: Ties schedule to specific SY/Semester
        public string? Subject_Code { get; set; }
        public string? Section_ID { get; set; }
        public string? Professor_ID { get; set; }
        public string? Room_ID { get; set; }
        public string? Time_Start { get; set; }
        public string? Time_End { get; set; }
        public string? Class_Days { get; set; }

        public string? Subject_Title { get; set; }
        public string? Section_Name { get; set; }
        public string? Professor_Name { get; set; }
        public string? Professor_Face_Reference_Path { get; set; }
        public string? Building { get; set; }
        public string? Subject_Type { get; set; }
    }
}
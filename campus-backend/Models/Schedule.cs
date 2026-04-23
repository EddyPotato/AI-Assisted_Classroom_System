namespace campus_backend.Models
{
    public class Schedule
    {
        public string? Schedule_ID { get; set; }
        public string? Subject_Code { get; set; }
        public string? Section_ID { get; set; }
        public string? Professor_ID { get; set; }
        public string? Room_ID { get; set; }
        public string? Time_Start { get; set; }
        public string? Time_End { get; set; }
        public string? Class_Days { get; set; }

        // Extended properties for the UI to read
        public string? Subject_Title { get; set; }
        public string? Section_Name { get; set; }
        public string? Professor_Name { get; set; }
        public string? Building { get; set; }
    }
}
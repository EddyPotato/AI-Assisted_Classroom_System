namespace campus_backend.Models
{
    public class SectionDTO
    {
        public string Section_ID { get; set; } = string.Empty;
        public string Section_Name { get; set; } = string.Empty;
        public string Course { get; set; } = string.Empty;
        public int Year_Level { get; set; }
        public int Student_Count { get; set; }
        public string? Primary_Adviser { get; set; }
        public string? Primary_Subject { get; set; }
    }

    // THE FIX: Added the new Data Model for the Subjects & Faculty List
    public class SectionScheduleDTO
    {
        public string Schedule_ID { get; set; } = string.Empty;
        public string Subject_Code { get; set; } = string.Empty;
        public string Subject_Title { get; set; } = string.Empty;
        public int Units { get; set; }
        public string Professor_Name { get; set; } = string.Empty;
        public string Class_Days { get; set; } = string.Empty;
        public string Time_Start { get; set; } = string.Empty;
        public string Time_End { get; set; } = string.Empty;
        public string Room_ID { get; set; } = string.Empty;
    }
}
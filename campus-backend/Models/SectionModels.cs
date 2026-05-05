namespace campus_backend.Models
{
    // The Frontend View Model (Includes Counts and Professor Names)
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
}
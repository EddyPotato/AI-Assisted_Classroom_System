namespace campus_backend.Models
{
    public class Subject
    {
        public string Subject_Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Prerequisites { get; set; }
        public int Units { get; set; }
    }
}
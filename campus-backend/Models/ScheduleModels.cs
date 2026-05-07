namespace campus_backend.Models
{
    public class BulkScheduleDto
    {
        public string? Subject_Code { get; set; }
        public string? Section_Id { get; set; }
        public string? Professor_Id { get; set; }
        public string? Room_Id { get; set; }
        public string? Time_Start { get; set; }
        public string? Time_End { get; set; }
        public string? Class_Days { get; set; }
        public string? Subject_Type { get; set; }
    }
}
using Microsoft.AspNetCore.Mvc;
using Oracle.ManagedDataAccess.Client;
using campus_backend.Models;
using campus_backend.Repositories;

namespace campus_backend.Controllers
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

    [ApiController]
    [Route("api/[controller]")]
    public class SchedulesController : ControllerBase
    {
        private readonly IScheduleRepository _scheduleRepository;
        private readonly string _connectionString;

        public SchedulesController(IScheduleRepository scheduleRepository, IConfiguration configuration)
        {
            _scheduleRepository = scheduleRepository;
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? configuration.GetConnectionString("OracleConnection")
                ?? configuration.GetConnectionString("OracleDb")
                ?? throw new InvalidOperationException("Connection string not found.");
        }

        [HttpGet]
        public async Task<IActionResult> GetSchedules()
        {
            try
            {
                var schedules = await _scheduleRepository.GetAllSchedulesAsync();
                return Ok(schedules);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database Error: " + ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateSchedule([FromBody] Schedule schedule)
        {
            try
            {
                await _scheduleRepository.CreateScheduleAsync(schedule);
                return Ok(new { message = "Schedule created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create: " + ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSchedule(string id, [FromBody] Schedule schedule)
        {
            try
            {
                schedule.Schedule_ID = id;
                await _scheduleRepository.UpdateScheduleAsync(schedule);
                return Ok(new { message = "Schedule updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update: " + ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchedule(string id)
        {
            await _scheduleRepository.DeleteScheduleAsync(id);
            return Ok(new { message = "Schedule deleted successfully!" });
        }

        [HttpPost("bulk-import")]
        public async Task<IActionResult> BulkImportSchedules([FromBody] List<BulkScheduleDto> schedules)
        {
            if (schedules == null || schedules.Count == 0)
                return BadRequest("No schedules provided.");

            int successCount = 0;
            var random = new Random();

            try
            {
                using var connection = new OracleConnection(_connectionString);
                await connection.OpenAsync();
                using var transaction = connection.BeginTransaction();

                var query = @"INSERT INTO CAMPUS_ADMIN.SCHEDULES
                              (SCHEDULE_ID, SUBJECT_CODE, SECTION_ID, PROFESSOR_ID, ROOM_ID, TIME_START, TIME_END, CLASS_DAYS, SUBJECT_TYPE)
                              VALUES (:id, :subj, :sec, :prof, :room, :tstart, :tend, :days, :type)";

                foreach (var s in schedules)
                {
                    if (string.IsNullOrWhiteSpace(s.Subject_Code) ||
                        string.IsNullOrWhiteSpace(s.Section_Id) ||
                        string.IsNullOrWhiteSpace(s.Time_Start) ||
                        string.IsNullOrWhiteSpace(s.Time_End) ||
                        string.IsNullOrWhiteSpace(s.Class_Days))
                    {
                        return BadRequest("Each schedule must include Subject_Code, Section_Id, Time_Start, Time_End, and Class_Days.");
                    }

                    string newSchedId = "SCH-" + Guid.NewGuid().ToString().Substring(0, 4).ToUpper() + random.Next(10, 99);

                    using var cmd = new OracleCommand(query, connection);
                    cmd.BindByName = true;
                    cmd.Transaction = transaction;
                    cmd.Parameters.Add(new OracleParameter("id", newSchedId));
                    cmd.Parameters.Add(new OracleParameter("subj", s.Subject_Code.Trim()));
                    cmd.Parameters.Add(new OracleParameter("sec", s.Section_Id.Trim()));
                    cmd.Parameters.Add(new OracleParameter("prof", string.IsNullOrWhiteSpace(s.Professor_Id) ? DBNull.Value : s.Professor_Id.Trim()));
                    cmd.Parameters.Add(new OracleParameter("room", string.IsNullOrWhiteSpace(s.Room_Id) ? DBNull.Value : s.Room_Id.Trim()));
                    cmd.Parameters.Add(new OracleParameter("tstart", s.Time_Start.Trim()));
                    cmd.Parameters.Add(new OracleParameter("tend", s.Time_End.Trim()));
                    cmd.Parameters.Add(new OracleParameter("days", s.Class_Days.Trim()));
                    cmd.Parameters.Add(new OracleParameter("type", string.IsNullOrWhiteSpace(s.Subject_Type) ? "Lec" : s.Subject_Type.Trim()));

                    await cmd.ExecuteNonQueryAsync();
                    successCount++;
                }

                await transaction.CommitAsync();
                return Ok(new { message = $"Successfully imported {successCount} schedules." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error during import.", error = ex.Message });
            }
        }
    }
}

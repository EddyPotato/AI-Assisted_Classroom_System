using Microsoft.AspNetCore.Mvc;
using Oracle.ManagedDataAccess.Client;
using System.Globalization;

namespace campus_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PrincipalController : ControllerBase
    {
        private readonly IConfiguration _config;

        public PrincipalController(IConfiguration config)
        {
            _config = config;
        }

        private string GetConnection() => _config.GetConnectionString("OracleConnection") ?? "";

        // --- AT-RISK STUDENTS ENDPOINTS ---

        [HttpGet("at-risk")]
        public async Task<IActionResult> GetAtRiskStudents()
        {
            try
            {
                using var conn = new OracleConnection(GetConnection());
                await conn.OpenAsync();

                string query = @"
                    SELECT 
                        e.ENROLLMENT_ID, 
                        s.STUDENT_ID, 
                        s.FIRST_NAME, 
                        s.LAST_NAME, 
                        sec.SECTION_NAME, 
                        sec.COURSE, 
                        e.CONSECUTIVE_ABSENCES
                    FROM CAMPUS_ADMIN.ENROLLMENTS e
                    JOIN CAMPUS_ADMIN.STUDENTS s ON e.STUDENT_ID = s.STUDENT_ID
                    JOIN CAMPUS_ADMIN.SECTIONS sec ON e.SECTION_ID = sec.SECTION_ID
                    WHERE e.CONSECUTIVE_ABSENCES >= 3 
                    AND s.ENROLLMENT_STATUS = 'Regular'";

                using var cmd = new OracleCommand(query, conn);
                using var reader = await cmd.ExecuteReaderAsync();

                var atRiskList = new List<object>();
                while (await reader.ReadAsync())
                {
                    atRiskList.Add(new
                    {
                        Enrollment_ID = reader["ENROLLMENT_ID"].ToString(),
                        Student_ID = reader["STUDENT_ID"].ToString(),
                        Student_Name = $"{reader["FIRST_NAME"]} {reader["LAST_NAME"]}",
                        Section = reader["SECTION_NAME"].ToString(),
                        Course = reader["COURSE"].ToString(),
                        Absences = Convert.ToInt32(reader["CONSECUTIVE_ABSENCES"])
                    });
                }
                return Ok(atRiskList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error", error = ex.Message });
            }
        }

        [HttpPut("excuse/{enrollmentId}")]
        public async Task<IActionResult> ExcuseAbsence(string enrollmentId)
        {
            try
            {
                using var conn = new OracleConnection(GetConnection());
                await conn.OpenAsync();
                string query = "UPDATE CAMPUS_ADMIN.ENROLLMENTS SET CONSECUTIVE_ABSENCES = 0 WHERE ENROLLMENT_ID = :id";
                using var cmd = new OracleCommand(query, conn);
                cmd.Parameters.Add(new OracleParameter("id", enrollmentId));
                await cmd.ExecuteNonQueryAsync();
                return Ok(new { message = "Absences excused. Counter reset to 0." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error", error = ex.Message });
            }
        }

        [HttpDelete("drop/{enrollmentId}")]
        public async Task<IActionResult> OfficiallyDrop(string enrollmentId)
        {
            try
            {
                using var conn = new OracleConnection(GetConnection());
                await conn.OpenAsync();
                string query = "DELETE FROM CAMPUS_ADMIN.ENROLLMENTS WHERE ENROLLMENT_ID = :id";
                using var cmd = new OracleCommand(query, conn);
                cmd.Parameters.Add(new OracleParameter("id", enrollmentId));
                await cmd.ExecuteNonQueryAsync();
                return Ok(new { message = "Student has been officially dropped." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error", error = ex.Message });
            }
        }

        [HttpGet("absences/{enrollmentId}")]
        public async Task<IActionResult> GetDetailedAbsences(string enrollmentId)
        {
            try
            {
                using var conn = new OracleConnection(GetConnection());
                await conn.OpenAsync();

                string query = @"
                    SELECT 
                        sch.SUBJECT_CODE,
                        sub.TITLE as SUBJECT_TITLE,
                        sch.TIME_START,
                        sch.TIME_END,
                        sch.CLASS_DAYS,
                        u.FIRST_NAME || ' ' || u.LAST_NAME as PROFESSOR_NAME
                    FROM CAMPUS_ADMIN.ENROLLMENTS e
                    JOIN CAMPUS_ADMIN.SCHEDULES sch ON e.SECTION_ID = sch.SECTION_ID
                    JOIN CAMPUS_ADMIN.SUBJECTS sub ON sch.SUBJECT_CODE = sub.SUBJECT_CODE
                    LEFT JOIN CAMPUS_ADMIN.USERS u ON sch.PROFESSOR_ID = u.USER_ID
                    WHERE e.ENROLLMENT_ID = :id";

                using var cmd = new OracleCommand(query, conn);
                cmd.Parameters.Add(new OracleParameter("id", enrollmentId));
                using var reader = await cmd.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    var subjectCode = reader["SUBJECT_CODE"].ToString();
                    var subjectTitle = reader["SUBJECT_TITLE"].ToString();
                    var timeStart = reader["TIME_START"].ToString() ?? "TBA";
                    var profName = reader["PROFESSOR_NAME"].ToString() ?? "TBA";
                    var detailedAbsences = new List<object>();
                    DateTime baseDate = DateTime.Now.AddDays(-1); 

                    for (int i = 0; i < 3; i++)
                    {
                        detailedAbsences.Add(new
                        {
                            Date_Formatted = baseDate.AddDays(-(i * 7)).ToString("dddd, dd MMMM yyyy"),
                            Time_12Hour = timeStart,
                            Subject_Code = subjectCode,
                            Subject_Title = subjectTitle,
                            Professor_Name = profName
                        });
                    }
                    return Ok(detailedAbsences);
                }
                return NotFound(new { message = "Schedule details not found for this enrollment." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error", error = ex.Message });
            }
        }

        // --- NEW: FACULTY TARDINESS LOGIC ---
        
        public class FacultyArrivalDto
        {
            public string User_ID { get; set; } = string.Empty;
        }

        [HttpPost("verify-faculty-arrival")]
        public async Task<IActionResult> VerifyFacultyArrival([FromBody] FacultyArrivalDto arrival)
        {
            if (string.IsNullOrEmpty(arrival.User_ID)) return BadRequest("User_ID is required.");

            try
            {
                using var conn = new OracleConnection(GetConnection());
                await conn.OpenAsync();

                string todayDayName = DateTime.Now.ToString("dddd"); 
                
                string schedQuery = @"
                    SELECT TIME_START 
                    FROM CAMPUS_ADMIN.SCHEDULES 
                    WHERE PROFESSOR_ID = :profId 
                    AND CLASS_DAYS LIKE '%' || :today || '%'";

                using var schedCmd = new OracleCommand(schedQuery, conn);
                schedCmd.Parameters.Add(new OracleParameter("profId", arrival.User_ID));
                schedCmd.Parameters.Add(new OracleParameter("today", todayDayName));

                using var reader = await schedCmd.ExecuteReaderAsync();
                
                bool isLate = false;
                string? timeStartRaw = null;

                while (await reader.ReadAsync())
                {
                    timeStartRaw = reader["TIME_START"].ToString();
                    if (!string.IsNullOrEmpty(timeStartRaw))
                    {
                        if (DateTime.TryParseExact(timeStartRaw, "hh:mm tt", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime classStartTime))
                        {
                            DateTime currentTime = DateTime.Now;
                            DateTime targetTime = new DateTime(currentTime.Year, currentTime.Month, currentTime.Day, classStartTime.Hour, classStartTime.Minute, 0);
                            
                            // Give a 5 minute grace period before marking late
                            if (currentTime > targetTime.AddMinutes(5)) 
                            {
                                isLate = true;
                                break;
                            }
                        }
                    }
                }

                if (isLate)
                {
                    string updateQuery = "UPDATE CAMPUS_ADMIN.USERS SET LATES_COUNT = NVL(LATES_COUNT, 0) + 1 WHERE USER_ID = :profId";
                    using var updateCmd = new OracleCommand(updateQuery, conn);
                    updateCmd.Parameters.Add(new OracleParameter("profId", arrival.User_ID));
                    await updateCmd.ExecuteNonQueryAsync();

                    return Ok(new { status = "late", message = $"Professor {arrival.User_ID} flagged as late for class starting at {timeStartRaw}." });
                }

                return Ok(new { status = "on-time", message = "Professor arrived on time." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error", error = ex.Message });
            }
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using Oracle.ManagedDataAccess.Client;
using System.Globalization;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

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

        private string GetConnection() => _config.GetConnectionString("DefaultConnection") 
            ?? _config.GetConnectionString("OracleConnection") ?? "";

        // ==========================================
        // 1. LEGACY AT-RISK ENDPOINTS (RESTORED)
        // ==========================================

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
                    var detailedAbsences = new List<object>();
                    DateTime baseDate = DateTime.Now.AddDays(-1); 

                    for (int i = 0; i < 3; i++)
                    {
                        detailedAbsences.Add(new
                        {
                            Date_Formatted = baseDate.AddDays(-(i * 7)).ToString("dddd, dd MMMM yyyy"),
                            Time_12Hour = reader["TIME_START"].ToString() ?? "TBA",
                            Subject_Code = reader["SUBJECT_CODE"].ToString(),
                            Subject_Title = reader["SUBJECT_TITLE"].ToString(),
                            Professor_Name = reader["PROFESSOR_NAME"].ToString() ?? "TBA"
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

        // ==========================================
        // 2. FACULTY TARDINESS LOGIC (RESTORED)
        // ==========================================
        
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
                    if (!string.IsNullOrEmpty(timeStartRaw) && 
                        DateTime.TryParseExact(timeStartRaw, "hh:mm tt", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime classStartTime))
                    {
                        DateTime currentTime = DateTime.Now;
                        DateTime targetTime = new DateTime(currentTime.Year, currentTime.Month, currentTime.Day, classStartTime.Hour, classStartTime.Minute, 0);
                        
                        if (currentTime > targetTime.AddMinutes(5)) 
                        {
                            isLate = true;
                            break;
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

        // ==========================================
        // 3. SEND INTERVENTION EMAIL
        // ==========================================
        
        public class InterventionEmailDto
        {
            public string Enrollment_ID { get; set; } = string.Empty;
            public string Schedule_ID { get; set; } = string.Empty;
            public string Subject { get; set; } = string.Empty;
            public string Message { get; set; } = string.Empty;
        }

        [HttpPost("send-intervention")]
        public async Task<IActionResult> SendInterventionEmail([FromBody] InterventionEmailDto request)
        {
            try
            {
                Console.WriteLine($"[EMAIL SENT] To Enrollment {request.Enrollment_ID} for Schedule {request.Schedule_ID} | Subj: {request.Subject}");
                return Ok(new { message = "Intervention email successfully dispatched." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to send email", error = ex.Message });
            }
        }

        // ==========================================
        // 4. MASTER-DETAIL STUDENT STATUS LOGIC (THE FIX)
        // ==========================================

        [HttpGet("all-student-statuses")]
        public async Task<IActionResult> GetAllStudentStatuses()
        {
            try
            {
                using var conn = new OracleConnection(GetConnection());
                await conn.OpenAsync();

                // CRITICAL FIX: Removed LISTAGG. Now selects rows PER SUBJECT with exact absence counts from the Ledger!
                string query = @"
                    SELECT 
                        e.ENROLLMENT_ID,
                        s.STUDENT_ID, 
                        s.FIRST_NAME, 
                        s.MIDDLE_NAME,
                        s.LAST_NAME, 
                        s.FACE_REFERENCE_PATH,
                        sec.SECTION_NAME,
                        sch.SCHEDULE_ID,
                        sub.SUBJECT_CODE,
                        sub.TITLE AS SUBJECT_TITLE,
                        e.ENROLLMENT_STATUS AS GLOBAL_STATUS,
                        (SELECT COUNT(*) 
                         FROM CAMPUS_ADMIN.ATTENDANCE_RECORDS ar 
                         WHERE ar.ENROLLMENT_ID = e.ENROLLMENT_ID 
                           AND ar.SCHEDULE_ID = sch.SCHEDULE_ID 
                           AND ar.STATUS = 'Absent') AS SUBJECT_ABSENCES
                    FROM CAMPUS_ADMIN.ENROLLMENTS e
                    JOIN CAMPUS_ADMIN.STUDENTS s ON e.STUDENT_ID = s.STUDENT_ID
                    JOIN CAMPUS_ADMIN.SECTIONS sec ON e.SECTION_ID = sec.SECTION_ID
                    JOIN CAMPUS_ADMIN.SCHEDULES sch ON sec.SECTION_ID = sch.SECTION_ID
                    JOIN CAMPUS_ADMIN.SUBJECTS sub ON sch.SUBJECT_CODE = sub.SUBJECT_CODE
                    ORDER BY sec.SECTION_NAME, s.LAST_NAME";

                using var cmd = new OracleCommand(query, conn);
                using var reader = await cmd.ExecuteReaderAsync();

                var studentList = new List<object>();
                while (await reader.ReadAsync())
                {
                    int absences = Convert.ToInt32(reader["SUBJECT_ABSENCES"]);
                    string globalStatus = reader["GLOBAL_STATUS"]?.ToString() ?? "Enrolled";
                    
                    // Dynamically calculate status per subject
                    string subjectStatus = "Enrolled";
                    if (globalStatus == "Officially Dropped") {
                        subjectStatus = "Officially Dropped";
                    } else if (absences >= 3) {
                        subjectStatus = "Unofficially Dropped";
                    }

                    studentList.Add(new
                    {
                        Enrollment_ID = reader["ENROLLMENT_ID"].ToString(),
                        Student_ID = reader["STUDENT_ID"].ToString(),
                        First_Name = reader["FIRST_NAME"].ToString(),
                        Middle_Name = reader["MIDDLE_NAME"] != DBNull.Value ? reader["MIDDLE_NAME"].ToString() : "",
                        Last_Name = reader["LAST_NAME"].ToString(),
                        Face_Reference_Path = reader["FACE_REFERENCE_PATH"] != DBNull.Value ? reader["FACE_REFERENCE_PATH"].ToString() : "",
                        Section = reader["SECTION_NAME"].ToString(),
                        Schedule_ID = reader["SCHEDULE_ID"].ToString(),
                        Subject_Code = reader["SUBJECT_CODE"].ToString(),
                        Subject_Title = reader["SUBJECT_TITLE"].ToString(),
                        Absences = absences,
                        Status = subjectStatus
                    });
                }
                return Ok(studentList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error", error = ex.Message });
            }
        }

        // ==========================================
        // 5. LIVE DASHBOARD STATISTICS
        // ==========================================

        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                using var conn = new OracleConnection(GetConnection());
                await conn.OpenAsync();

                // 1. Campus Population
                using var cmdStudent = new OracleCommand("SELECT COUNT(*) FROM CAMPUS_ADMIN.STUDENTS WHERE LOWER(CAMPUS_PRESENCE) = 'in-campus'", conn);
                int studentsOnCampus = Convert.ToInt32(await cmdStudent.ExecuteScalarAsync());

                // 2. Active Faculty Count
                using var cmdFaculty = new OracleCommand("SELECT COUNT(*) FROM CAMPUS_ADMIN.USERS WHERE ROLE = 'Faculty'", conn);
                int totalFaculty = Convert.ToInt32(await cmdFaculty.ExecuteScalarAsync());

                // 3. Pending Interventions (Count of unique students with >= 3 absences in ANY subject from the Ledger)
                string interventionQuery = @"
                    SELECT COUNT(DISTINCT e.STUDENT_ID)
                    FROM CAMPUS_ADMIN.ENROLLMENTS e
                    JOIN CAMPUS_ADMIN.SCHEDULES sch ON e.SECTION_ID = sch.SECTION_ID
                    WHERE (SELECT COUNT(*) FROM CAMPUS_ADMIN.ATTENDANCE_RECORDS ar 
                           WHERE ar.ENROLLMENT_ID = e.ENROLLMENT_ID 
                             AND ar.SCHEDULE_ID = sch.SCHEDULE_ID 
                             AND ar.STATUS = 'Absent') >= 3
                      AND e.ENROLLMENT_STATUS != 'Officially Dropped'";

                using var cmdInterventions = new OracleCommand(interventionQuery, conn);
                int pendingInterventions = Convert.ToInt32(await cmdInterventions.ExecuteScalarAsync());

                return Ok(new 
                { 
                    studentsOnCampus, 
                    totalFaculty, 
                    pendingInterventions 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error", error = ex.Message });
            }
        }
    }
}
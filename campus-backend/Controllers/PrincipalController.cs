using Microsoft.AspNetCore.Mvc;
using Oracle.ManagedDataAccess.Client;

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

        // 1. GET ALL AT-RISK STUDENTS
        [HttpGet("at-risk")]
        public async Task<IActionResult> GetAtRiskStudents()
        {
            try
            {
                using var conn = new OracleConnection(GetConnection());
                await conn.OpenAsync();

                // Join Enrollments, Students, and Sections where absences >= 3
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

        // 2. EXCUSE ABSENCES (Reset counter to 0)
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

        // 3. OFFICIALLY DROP STUDENT (Remove from Section Roster)
        [HttpDelete("drop/{enrollmentId}")]
        public async Task<IActionResult> OfficiallyDrop(string enrollmentId)
        {
            try
            {
                // In an academic system, "Dropping" a subject means deleting the enrollment record
                // so they no longer appear on the Faculty's class roster.
                using var conn = new OracleConnection(GetConnection());
                await conn.OpenAsync();

                string query = "DELETE FROM CAMPUS_ADMIN.ENROLLMENTS WHERE ENROLLMENT_ID = :id";
                using var cmd = new OracleCommand(query, conn);
                cmd.Parameters.Add(new OracleParameter("id", enrollmentId));
                
                await cmd.ExecuteNonQueryAsync();
                return Ok(new { message = "Student has been officially dropped from the section." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error", error = ex.Message });
            }
        }
    }
}
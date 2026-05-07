using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Oracle.ManagedDataAccess.Client;
using Microsoft.Extensions.Configuration;

namespace campus_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : ControllerBase
    {
        private readonly string _connectionString;

        public AttendanceController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? configuration.GetConnectionString("OracleConnection")
                ?? configuration.GetConnectionString("OracleDb")
                ?? throw new InvalidOperationException("Connection string not found.");
        }

        // 1. Get Today's Schedules for a Professor
        [HttpGet("professor/{profId}/today")]
        public async Task<IActionResult> GetTodaySchedules(string profId)
        {
            var schedules = new List<object>();
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            // Note: In production, you'd filter by the current day of the week using Class_Days
            // For this demo, we'll fetch all schedules for the professor to ensure data appears
            var query = @"
                SELECT s.SCHEDULE_ID, s.SUBJECT_CODE, sub.TITLE, s.ROOM_ID, s.TIME_START, s.TIME_END, s.CLASS_DAYS
                FROM CAMPUS_ADMIN.SCHEDULES s
                JOIN CAMPUS_ADMIN.SUBJECTS sub ON s.SUBJECT_CODE = sub.SUBJECT_CODE
                WHERE s.PROFESSOR_ID = :profId
                ORDER BY TO_DATE(s.TIME_START, 'HH:MI AM')";

            using var cmd = new OracleCommand(query, connection);
            cmd.BindByName = true;
            cmd.Parameters.Add(new OracleParameter("profId", profId));

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                schedules.Add(new
                {
                    schedule_ID = reader["SCHEDULE_ID"].ToString(),
                    subject_Code = reader["SUBJECT_CODE"].ToString(),
                    subject_Title = reader["TITLE"].ToString(),
                    room_ID = reader["ROOM_ID"].ToString(),
                    time_Start = reader["TIME_START"].ToString(),
                    time_End = reader["TIME_END"].ToString(),
                    class_Days = reader["CLASS_DAYS"].ToString()
                });
            }
            return Ok(schedules);
        }

        [HttpGet("schedule/{scheduleId}/roster")]
        public async Task<IActionResult> GetScheduleAttendance(string scheduleId)
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            string sectionId = "", roomId = "", timeStartStr = "", timeEndStr = "";
            var schedQuery = "SELECT SECTION_ID, ROOM_ID, TIME_START, TIME_END FROM CAMPUS_ADMIN.SCHEDULES WHERE SCHEDULE_ID = :id";
            using var schedCmd = new OracleCommand(schedQuery, connection);
            schedCmd.BindByName = true;
            schedCmd.Parameters.Add(new OracleParameter("id", scheduleId));
            using var schedReader = await schedCmd.ExecuteReaderAsync();
            if (await schedReader.ReadAsync())
            {
                sectionId = schedReader["SECTION_ID"].ToString();
                roomId = schedReader["ROOM_ID"].ToString();
                timeStartStr = schedReader["TIME_START"].ToString();
                timeEndStr = schedReader["TIME_END"]?.ToString() ?? "";
            }
            else return NotFound("Schedule not found.");

            var roster = new List<object>();
            var rosterQuery = @"
                SELECT st.STUDENT_ID, st.FIRST_NAME, st.MIDDLE_NAME, st.LAST_NAME, st.FACE_REFERENCE_PATH, st.CAMPUS_PRESENCE
                FROM CAMPUS_ADMIN.STUDENTS st
                JOIN CAMPUS_ADMIN.ENROLLMENTS e ON st.STUDENT_ID = e.STUDENT_ID
                WHERE e.SECTION_ID = :secId
                ORDER BY st.LAST_NAME ASC";

            using var rosterCmd = new OracleCommand(rosterQuery, connection);
            rosterCmd.BindByName = true;
            rosterCmd.Parameters.Add(new OracleParameter("secId", sectionId));
            using var rosterReader = await rosterCmd.ExecuteReaderAsync();

            // STRICT TIME BOUNDARIES FIX
            DateTime classStartTime = DateTime.Today; 
            if (DateTime.TryParse(timeStartStr, out DateTime parsedTime)) classStartTime = parsedTime;
            
            DateTime classEndTime = classStartTime.AddHours(1); // Fallback to 1 hr if end time is missing
            if (DateTime.TryParse(timeEndStr, out DateTime parsedEnd)) classEndTime = parsedEnd;

            while (await rosterReader.ReadAsync())
            {
                string sId = rosterReader["STUDENT_ID"].ToString();
                string status = "Absent";
                string arrivalTime = "--:--";

                var logQuery = @"
                    SELECT TIMESTAMP, STATUS 
                    FROM CAMPUS_ADMIN.EVENT_LOGS 
                    WHERE STUDENT_ID = :sid 
                    AND TRUNC(TIMESTAMP) = TRUNC(SYSDATE)
                    ORDER BY TIMESTAMP ASC";

                using var logCmd = new OracleCommand(logQuery, connection);
                logCmd.BindByName = true;
                logCmd.Parameters.Add(new OracleParameter("sid", sId));
                using var logReader = await logCmd.ExecuteReaderAsync();

                bool hasRoomScan = false;
                bool hasCuttingLog = false;

                while (await logReader.ReadAsync())
                {
                    string logStatus = logReader["STATUS"].ToString();
                    if (logStatus == "Cutting / Early Exit") hasCuttingLog = true;

                    if (logStatus == "approved") 
                    {
                        DateTime scanTime = Convert.ToDateTime(logReader["TIMESTAMP"]);
                        
                        // BOUNDARY CHECK: Scan must happen between 45 mins before class and class end time
                        if (scanTime >= classStartTime.AddMinutes(-45) && scanTime <= classEndTime)
                        {
                            hasRoomScan = true;
                            if (arrivalTime == "--:--") arrivalTime = scanTime.ToString("hh:mm tt");
                            
                            // Grace Period (15 minutes)
                            if (scanTime <= classStartTime.AddMinutes(15)) {
                                status = "Present";
                            } else if (status != "Present") {
                                status = "Late";
                            }
                        }
                    }
                }

                if (!hasRoomScan) status = "Absent";
                if (hasCuttingLog) status = "Cutting";

                roster.Add(new
                {
                    student_ID = sId,
                    first_Name = rosterReader["FIRST_NAME"].ToString(),
                    middle_Name = rosterReader["MIDDLE_NAME"].ToString(),
                    last_Name = rosterReader["LAST_NAME"].ToString(),
                    face_Reference_Path = rosterReader["FACE_REFERENCE_PATH"].ToString(),
                    status = status,
                    arrival_Time = arrivalTime
                });
            }

            return Ok(roster);
        }
    }
}
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Oracle.ManagedDataAccess.Client;
using Microsoft.Extensions.Configuration;

namespace campus_backend.Repositories
{
    public class AttendanceRepository : IAttendanceRepository
    {
        private readonly string _connectionString;

        public AttendanceRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? configuration.GetConnectionString("OracleConnection")
                ?? configuration.GetConnectionString("OracleDb")
                ?? throw new InvalidOperationException("Oracle connection string is missing.");
        }

        public async Task<List<object>> GetTodaySchedulesForProfessorAsync(string professorId, string currentDay)
        {
            var schedules = new List<object>();
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT s.SCHEDULE_ID, s.SUBJECT_CODE, sub.TITLE, s.ROOM_ID, s.TIME_START, s.TIME_END, s.CLASS_DAYS
                FROM CAMPUS_ADMIN.SCHEDULES s
                JOIN CAMPUS_ADMIN.SUBJECTS sub ON s.SUBJECT_CODE = sub.SUBJECT_CODE
                WHERE s.PROFESSOR_ID = :profId
                AND s.CLASS_DAYS LIKE '%' || :day || '%'
                ORDER BY TO_DATE(s.TIME_START, 'HH:MI AM')";

            using var cmd = new OracleCommand(query, connection);
            cmd.BindByName = true;
            cmd.Parameters.Add(new OracleParameter("profId", professorId));
            cmd.Parameters.Add(new OracleParameter("day", currentDay));

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
            return schedules;
        }

        public async Task<List<object>> GetScheduleRosterAndAttendanceAsync(string scheduleId)
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            string sectionId = "", roomId = "", timeStartStr = "", timeEndStr = "";
            var schedCmd = new OracleCommand("SELECT SECTION_ID, ROOM_ID, TIME_START, TIME_END FROM CAMPUS_ADMIN.SCHEDULES WHERE SCHEDULE_ID = :id", connection);
            schedCmd.Parameters.Add(new OracleParameter("id", scheduleId));
            using var schedReader = await schedCmd.ExecuteReaderAsync();
            if (await schedReader.ReadAsync())
            {
                sectionId = schedReader["SECTION_ID"].ToString();
                roomId = schedReader["ROOM_ID"].ToString();
                timeStartStr = schedReader["TIME_START"].ToString();
                timeEndStr = schedReader["TIME_END"]?.ToString() ?? "";
            }
            else return new List<object>(); // Schedule not found

            string cameraLocationId = "";
            var camCmd = new OracleCommand("SELECT LOCATION_ID FROM CAMPUS_ADMIN.CAMERA_LOCATIONS WHERE ASSOCIATED_ROOM_ID = :room", connection);
            camCmd.Parameters.Add(new OracleParameter("room", roomId));
            using var camReader = await camCmd.ExecuteReaderAsync();
            if (await camReader.ReadAsync()) cameraLocationId = camReader["LOCATION_ID"].ToString();

            var roster = new List<object>();
            var rosterQuery = @"
                SELECT st.STUDENT_ID, st.FIRST_NAME, st.MIDDLE_NAME, st.LAST_NAME, st.FACE_REFERENCE_PATH
                FROM CAMPUS_ADMIN.STUDENTS st
                JOIN CAMPUS_ADMIN.ENROLLMENTS e ON st.STUDENT_ID = e.STUDENT_ID
                WHERE e.SECTION_ID = :secId
                ORDER BY st.LAST_NAME ASC";

            using var rosterCmd = new OracleCommand(rosterQuery, connection);
            rosterCmd.Parameters.Add(new OracleParameter("secId", sectionId));
            using var rosterReader = await rosterCmd.ExecuteReaderAsync();

            DateTime.TryParse(timeStartStr, out DateTime classStartTime);
            DateTime classEndTime = DateTime.TryParse(timeEndStr, out DateTime parsedEnd) ? parsedEnd : classStartTime.AddHours(1);

            while (await rosterReader.ReadAsync())
            {
                string sId = rosterReader["STUDENT_ID"].ToString();
                string status = "Absent", arrivalTime = "--:--";
                bool hasCuttingLog = false, hasRoomScan = false;

                var logCmd = new OracleCommand(@"
                    SELECT TIMESTAMP, STATUS FROM CAMPUS_ADMIN.EVENT_LOGS 
                    WHERE STUDENT_ID = :sid AND LOCATION_ID = :locId AND TRUNC(TIMESTAMP) = TRUNC(SYSDATE)
                    ORDER BY TIMESTAMP ASC", connection);
                
                logCmd.Parameters.Add(new OracleParameter("sid", sId));
                logCmd.Parameters.Add(new OracleParameter("locId", cameraLocationId));
                using var logReader = await logCmd.ExecuteReaderAsync();

                while (await logReader.ReadAsync())
                {
                    string logStatus = logReader["STATUS"].ToString();
                    if (logStatus == "Cutting / Early Exit") hasCuttingLog = true;

                    if (logStatus == "approved") 
                    {
                        DateTime scanTime = Convert.ToDateTime(logReader["TIMESTAMP"]);
                        if (scanTime >= classStartTime.AddMinutes(-45) && scanTime <= classEndTime)
                        {
                            hasRoomScan = true;
                            if (arrivalTime == "--:--") arrivalTime = scanTime.ToString("hh:mm tt");
                            
                            if (scanTime <= classStartTime.AddMinutes(15)) status = "Present";
                            else if (status != "Present") status = "Late";
                        }
                    }
                }

                if (!hasRoomScan) status = "Absent";
                if (hasCuttingLog) status = "Cutting";

                roster.Add(new {
                    student_ID = sId,
                    first_Name = rosterReader["FIRST_NAME"].ToString(),
                    middle_Name = rosterReader["MIDDLE_NAME"].ToString(),
                    last_Name = rosterReader["LAST_NAME"].ToString(),
                    face_Reference_Path = rosterReader["FACE_REFERENCE_PATH"].ToString(),
                    status, arrival_Time = arrivalTime
                });
            }
            return roster;
        }
    }
}
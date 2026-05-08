using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;
using campus_backend.Models;

namespace campus_backend.Repositories
{
    public class AttendanceRepository : IAttendanceRepository
    {
        private readonly string _connectionString;

        public AttendanceRepository(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection")
                ?? config.GetConnectionString("OracleConnection")
                ?? throw new InvalidOperationException("Connection string is missing.");
        }

        public async Task<string> GetCurrentPresenceAsync(string personId, string role)
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();
            string table = role == "student" ? "STUDENTS" : "USERS";
            string idCol = role == "student" ? "STUDENT_ID" : "USER_ID";

            var cmd = new OracleCommand($"SELECT CAMPUS_PRESENCE FROM CAMPUS_ADMIN.{table} WHERE {idCol} = :id", connection);
            cmd.BindByName = true;
            cmd.Parameters.Add(new OracleParameter("id", personId));
            var result = await cmd.ExecuteScalarAsync();
            
            return result?.ToString() ?? "offline";
        }

        public async Task UpdatePresenceAndLogAsync(string personId, string role, string locationId, string newPresence, string eventLogStatus)
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();
            string table = role == "student" ? "STUDENTS" : "USERS";
            string idCol = role == "student" ? "STUDENT_ID" : "USER_ID";

            var updateCmd = new OracleCommand($"UPDATE CAMPUS_ADMIN.{table} SET CAMPUS_PRESENCE = :pres WHERE {idCol} = :id", connection);
            updateCmd.BindByName = true;
            updateCmd.Parameters.Add(new OracleParameter("pres", newPresence));
            updateCmd.Parameters.Add(new OracleParameter("id", personId));
            await updateCmd.ExecuteNonQueryAsync();

            var logCmd = new OracleCommand(@"
                INSERT INTO CAMPUS_ADMIN.EVENT_LOGS (STUDENT_ID, STATUS, TIMESTAMP, LOCATION_ID)
                VALUES (:id, :stat, SYSDATE, :loc)", connection);
            logCmd.BindByName = true;
            logCmd.Parameters.Add(new OracleParameter("id", personId));
            logCmd.Parameters.Add(new OracleParameter("stat", eventLogStatus));
            logCmd.Parameters.Add(new OracleParameter("loc", locationId));
            await logCmd.ExecuteNonQueryAsync();
        }

        public async Task<IEnumerable<Schedule>> GetTodaySchedulesForProfessorAsync(string professorId)
        {
            var schedules = new List<Schedule>();
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            string currentDay = DateTime.Now.ToString("ddd");
            
            var query = @"
                SELECT s.SCHEDULE_ID, s.SUBJECT_CODE, s.SECTION_ID, s.PROFESSOR_ID, 
                       s.ROOM_ID, s.TIME_START, s.TIME_END, s.CLASS_DAYS,
                       sub.TITLE as SUBJECT_TITLE, sec.SECTION_NAME
                FROM CAMPUS_ADMIN.SCHEDULES s
                LEFT JOIN CAMPUS_ADMIN.SUBJECTS sub ON s.SUBJECT_CODE = sub.SUBJECT_CODE
                LEFT JOIN CAMPUS_ADMIN.SECTIONS sec ON s.SECTION_ID = sec.SECTION_ID
                WHERE s.PROFESSOR_ID = :profId 
                AND s.CLASS_DAYS LIKE '%' || :day || '%'";

            using var cmd = new OracleCommand(query, connection);
            cmd.BindByName = true;
            cmd.Parameters.Add(new OracleParameter("profId", professorId));
            cmd.Parameters.Add(new OracleParameter("day", currentDay));

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                schedules.Add(new Schedule
                {
                    Schedule_ID = reader["SCHEDULE_ID"]?.ToString() ?? "",
                    Subject_Code = reader["SUBJECT_CODE"]?.ToString() ?? "",
                    Section_ID = reader["SECTION_ID"]?.ToString() ?? "",
                    Professor_ID = reader["PROFESSOR_ID"]?.ToString() ?? "",
                    Room_ID = reader["ROOM_ID"]?.ToString() ?? "",
                    Time_Start = reader["TIME_START"]?.ToString() ?? "",
                    Time_End = reader["TIME_END"]?.ToString() ?? "",
                    Class_Days = reader["CLASS_DAYS"]?.ToString() ?? "",
                    Subject_Title = reader["SUBJECT_TITLE"]?.ToString(),
                    Section_Name = reader["SECTION_NAME"]?.ToString()
                });
            }
            return schedules;
        }

        public async Task<IEnumerable<RosterStudent>> GetScheduleRosterAndAttendanceAsync(string scheduleId)
        {
            var roster = new List<RosterStudent>();
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT st.STUDENT_ID, st.FIRST_NAME, st.LAST_NAME, st.CAMPUS_PRESENCE
                FROM CAMPUS_ADMIN.ENROLLMENTS e
                JOIN CAMPUS_ADMIN.STUDENTS st ON e.STUDENT_ID = st.STUDENT_ID
                JOIN CAMPUS_ADMIN.SCHEDULES s ON e.SECTION_ID = s.SECTION_ID
                WHERE s.SCHEDULE_ID = :schedId";

            using var cmd = new OracleCommand(query, connection);
            cmd.BindByName = true;
            cmd.Parameters.Add(new OracleParameter("schedId", scheduleId));

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                roster.Add(new RosterStudent
                {
                    Student_ID = reader["STUDENT_ID"]?.ToString(),
                    First_Name = reader["FIRST_NAME"]?.ToString(),
                    Last_Name = reader["LAST_NAME"]?.ToString(),
                    Enrollment_Status = reader["CAMPUS_PRESENCE"]?.ToString() ?? "Offline"
                });
            }
            return roster;
        }
    }
}
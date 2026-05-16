using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;
using campus_backend.Models;

namespace campus_backend.Repositories
{
    public class ScheduleRepository : IScheduleRepository
    {
        private readonly string _connectionString;

        public ScheduleRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? configuration.GetConnectionString("OracleConnection")
                ?? configuration.GetConnectionString("OracleDb")
                ?? throw new InvalidOperationException("Oracle connection string is missing.");
        }

        // --- GET ALL SCHEDULES ---
        public async Task<IEnumerable<Schedule>> GetAllSchedulesAsync(string termId = null)
        {
            var schedules = new List<Schedule>();

            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                // THE FIX: Included s.TERM_ID and added a WHERE clause filter for the active academic term
                string sql = @"
                    SELECT s.Schedule_ID, s.Term_ID, s.Subject_Code, s.Subject_Type, sub.Title AS Subject_Title,
                            s.Section_ID, sec.Section_Name,
                            s.Professor_ID, 
                            u.First_Name || CASE WHEN u.MIDDLE_NAME IS NOT NULL THEN ' ' || u.MIDDLE_NAME ELSE '' END || ' ' || u.Last_Name AS Professor_Name,
                            u.FACE_REFERENCE_PATH AS Professor_Face_Reference_Path,
                            s.Room_ID, r.Building,
                            s.Time_Start, s.Time_End, s.Class_Days
                    FROM Schedules s
                    LEFT JOIN Subjects sub ON s.Subject_Code = sub.Subject_Code
                    LEFT JOIN Sections sec ON s.Section_ID = sec.Section_ID
                    LEFT JOIN Users u ON s.Professor_ID = u.User_ID
                    LEFT JOIN Rooms r ON s.Room_ID = r.Room_ID
                    WHERE (s.Term_ID = :termId OR :termId IS NULL)";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("termId", string.IsNullOrEmpty(termId) ? (object)DBNull.Value : termId));

                    await con.OpenAsync();
                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            schedules.Add(new Schedule
                            {
                                Schedule_ID = reader["Schedule_ID"].ToString(),
                                Term_ID = reader["Term_ID"]?.ToString(), // NEW
                                Subject_Code = reader["Subject_Code"].ToString(),
                                Subject_Type = reader["Subject_Type"] != DBNull.Value ? reader["Subject_Type"].ToString() : "Lec",
                                Subject_Title = reader["Subject_Title"].ToString(),
                                Section_ID = reader["Section_ID"].ToString(),
                                Section_Name = reader["Section_Name"].ToString(),
                                Professor_ID = reader["Professor_ID"].ToString(),
                                Professor_Name = reader["Professor_Name"].ToString(),
                                Professor_Face_Reference_Path = reader["Professor_Face_Reference_Path"]?.ToString(),
                                Room_ID = reader["Room_ID"].ToString(),
                                Building = reader["Building"].ToString(),
                                Time_Start = reader["Time_Start"].ToString(),
                                Time_End = reader["Time_End"].ToString(),
                                Class_Days = reader["Class_Days"].ToString()
                            });
                        }
                    }
                }
            }
            return schedules;
        }

        // --- CREATE SCHEDULE ---
        public async Task CreateScheduleAsync(Schedule schedule)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                Random rnd = new Random();
                string newId = $"SCH-{rnd.Next(1000, 9999)}";
                
                // THE FIX: Inject TERM_ID into the database insert
                string sql = @"
                    INSERT INTO Schedules (Schedule_ID, Term_ID, Subject_Code, Subject_Type, Section_ID, Professor_ID, Room_ID, Time_Start, Time_End, Class_Days) 
                    VALUES (:id, :term, :subj, :type, :sec, :prof, :room, :tstart, :tend, :days)";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", newId));
                    cmd.Parameters.Add(new OracleParameter("term", string.IsNullOrEmpty(schedule.Term_ID) ? DBNull.Value : schedule.Term_ID));
                    cmd.Parameters.Add(new OracleParameter("subj", schedule.Subject_Code));
                    cmd.Parameters.Add(new OracleParameter("type", string.IsNullOrEmpty(schedule.Subject_Type) ? "Lec" : schedule.Subject_Type));
                    cmd.Parameters.Add(new OracleParameter("sec", schedule.Section_ID));
                    
                    cmd.Parameters.Add(new OracleParameter("prof", string.IsNullOrEmpty(schedule.Professor_ID) ? DBNull.Value : schedule.Professor_ID));
                    cmd.Parameters.Add(new OracleParameter("room", string.IsNullOrEmpty(schedule.Room_ID) ? DBNull.Value : schedule.Room_ID));
                    
                    cmd.Parameters.Add(new OracleParameter("tstart", schedule.Time_Start));
                    cmd.Parameters.Add(new OracleParameter("tend", schedule.Time_End));
                    cmd.Parameters.Add(new OracleParameter("days", schedule.Class_Days));
                    
                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        // --- UPDATE SCHEDULE ---
        public async Task UpdateScheduleAsync(Schedule schedule)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"
                    UPDATE Schedules 
                    SET Term_ID = :term,
                        Subject_Code = :subj, 
                        Subject_Type = :type, 
                        Section_ID = :sec, 
                        Professor_ID = :prof, 
                        Room_ID = :room, 
                        Time_Start = :tstart, 
                        Time_End = :tend, 
                        Class_Days = :days 
                    WHERE Schedule_ID = :id";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("term", string.IsNullOrEmpty(schedule.Term_ID) ? DBNull.Value : schedule.Term_ID));
                    cmd.Parameters.Add(new OracleParameter("subj", schedule.Subject_Code));
                    cmd.Parameters.Add(new OracleParameter("type", string.IsNullOrEmpty(schedule.Subject_Type) ? "Lec" : schedule.Subject_Type));
                    cmd.Parameters.Add(new OracleParameter("sec", schedule.Section_ID));
                    
                    cmd.Parameters.Add(new OracleParameter("prof", string.IsNullOrEmpty(schedule.Professor_ID) ? DBNull.Value : schedule.Professor_ID));
                    cmd.Parameters.Add(new OracleParameter("room", string.IsNullOrEmpty(schedule.Room_ID) ? DBNull.Value : schedule.Room_ID));
                    
                    cmd.Parameters.Add(new OracleParameter("tstart", schedule.Time_Start));
                    cmd.Parameters.Add(new OracleParameter("tend", schedule.Time_End));
                    cmd.Parameters.Add(new OracleParameter("days", schedule.Class_Days));
                    
                    cmd.Parameters.Add(new OracleParameter("id", schedule.Schedule_ID));
                    
                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        // --- DELETE SCHEDULE ---
        public async Task DeleteScheduleAsync(string id)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = "DELETE FROM Schedules WHERE Schedule_ID = :id";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", id));
                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        // --- BULK IMPORT SCHEDULES ---
        public async Task<int> BulkImportSchedulesAsync(List<BulkScheduleDto> schedules, string termId)
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();
            
            using var transaction = connection.BeginTransaction();
            int successCount = 0;

            try
            {
                foreach (var s in schedules)
                {
                    if (string.IsNullOrWhiteSpace(s.Subject_Code) || string.IsNullOrWhiteSpace(s.Section_Id) || string.IsNullOrWhiteSpace(s.Time_Start))
                        continue; 

                    string newSchedId = $"SCH-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

                    var cmd = new OracleCommand(@"
                        INSERT INTO CAMPUS_ADMIN.SCHEDULES 
                        (SCHEDULE_ID, TERM_ID, SUBJECT_CODE, SECTION_ID, PROFESSOR_ID, ROOM_ID, TIME_START, TIME_END, CLASS_DAYS, SUBJECT_TYPE) 
                        VALUES (:id, :term, :subj, :sec, :prof, :room, :tstart, :tend, :days, :type)", connection);
                    
                    cmd.BindByName = true;
                    cmd.Transaction = transaction;
                    
                    cmd.Parameters.Add(new OracleParameter("id", newSchedId));
                    cmd.Parameters.Add(new OracleParameter("term", string.IsNullOrEmpty(termId) ? DBNull.Value : termId));
                    cmd.Parameters.Add(new OracleParameter("subj", s.Subject_Code.Trim()));
                    cmd.Parameters.Add(new OracleParameter("sec", s.Section_Id.Trim()));
                    cmd.Parameters.Add(new OracleParameter("prof", string.IsNullOrWhiteSpace(s.Professor_Id) ? DBNull.Value : s.Professor_Id.Trim()));
                    cmd.Parameters.Add(new OracleParameter("room", string.IsNullOrWhiteSpace(s.Room_Id) ? DBNull.Value : s.Room_Id.Trim()));
                    cmd.Parameters.Add(new OracleParameter("tstart", s.Time_Start.Trim()));
                    cmd.Parameters.Add(new OracleParameter("tend", s.Time_End?.Trim() ?? (object)DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("days", s.Class_Days?.Trim() ?? "TBA"));
                    cmd.Parameters.Add(new OracleParameter("type", string.IsNullOrWhiteSpace(s.Subject_Type) ? "Lec" : s.Subject_Type.Trim()));

                    await cmd.ExecuteNonQueryAsync();
                    successCount++;
                }

                await transaction.CommitAsync();
                return successCount;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw; 
            }
        }

        // Legacy compatibility
        public async Task<bool> IsStudentInClassNowAsync(string studentId, string roomId)
        {
            var result = await CheckStudentClassAccessAsync(studentId, roomId);
            return result.Status == "InSession";
        }

        // Advanced State Machine Checker
        public async Task<(string Status, string Message)> CheckStudentClassAccessAsync(string studentId, string roomId)
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            string currentDay = DateTime.Now.ToString("ddd");
            DateTime now = DateTime.Now;

            // THE FIX: Strictly join with ACADEMIC_TERMS to ensure the schedule and enrollment are for the ACTIVE term only!
            var schedCmd = new OracleCommand(@"
                SELECT s.TIME_START, s.TIME_END, s.SUBJECT_CODE, 
                       sec.SECTION_NAME, u.LAST_NAME, u.FIRST_NAME 
                FROM CAMPUS_ADMIN.SCHEDULES s
                JOIN CAMPUS_ADMIN.ENROLLMENTS e ON s.SECTION_ID = e.SECTION_ID
                JOIN CAMPUS_ADMIN.ACADEMIC_TERMS term ON s.TERM_ID = term.TERM_ID
                LEFT JOIN CAMPUS_ADMIN.SECTIONS sec ON s.SECTION_ID = sec.SECTION_ID
                LEFT JOIN CAMPUS_ADMIN.USERS u ON s.PROFESSOR_ID = u.USER_ID
                WHERE s.ROOM_ID = :room 
                  AND e.STUDENT_ID = :sid 
                  AND s.CLASS_DAYS LIKE '%' || :day || '%'
                  AND term.IS_ACTIVE = 1 
                  AND e.TERM_ID = term.TERM_ID", connection);
            
            schedCmd.Parameters.Add(new OracleParameter("room", roomId));
            schedCmd.Parameters.Add(new OracleParameter("sid", studentId));
            schedCmd.Parameters.Add(new OracleParameter("day", currentDay));

            var classList = new List<(DateTime Start, DateTime End, string Subj, string Sec, string Prof)>();
            
            using var reader = await schedCmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                if (DateTime.TryParse(reader["TIME_START"].ToString(), out DateTime startTime) && 
                    DateTime.TryParse(reader["TIME_END"]?.ToString(), out DateTime endTime))
                {
                    string profFirst = reader["FIRST_NAME"]?.ToString() ?? "";
                    string profLast = reader["LAST_NAME"]?.ToString() ?? "TBA";
                    string profName = string.IsNullOrWhiteSpace(profFirst) ? profLast : $"{profFirst} {profLast}";

                    classList.Add((startTime, endTime, 
                        reader["SUBJECT_CODE"]?.ToString(), 
                        reader["SECTION_NAME"]?.ToString(), 
                        profName));
                }
            }

            if (classList.Count == 0) return ("Denied", "No scheduled class here today for the current semester.");

            classList.Sort((a, b) => a.Start.CompareTo(b.Start));

            foreach (var c in classList)
            {
                if (now >= c.Start && now <= c.End)
                {
                    var dupCmd = new OracleCommand(@"
                        SELECT COUNT(*) FROM CAMPUS_ADMIN.EVENT_LOGS el
                        JOIN CAMPUS_ADMIN.CAMERA_LOCATIONS cl ON el.LOCATION_ID = cl.LOCATION_ID
                        WHERE el.STUDENT_ID = :sid 
                          AND cl.ASSOCIATED_ROOM_ID = :room
                          AND el.STATUS = 'approved'
                          AND el.TIMESTAMP >= :cStart 
                          AND el.TIMESTAMP <= :cEnd", connection);

                    dupCmd.Parameters.Add(new OracleParameter("sid", studentId));
                    dupCmd.Parameters.Add(new OracleParameter("room", roomId));
                    dupCmd.Parameters.Add(new OracleParameter("cStart", c.Start));
                    dupCmd.Parameters.Add(new OracleParameter("cEnd", c.End));

                    int logCount = Convert.ToInt32(await dupCmd.ExecuteScalarAsync());

                    if (logCount > 0)
                    {
                        return ("Early", "ATTENDANCE ALREADY RECORDED: You are already marked present/late for this session.");
                    }

                    return ("InSession", "CLASS ATTENDANCE RECORDED.");
                }
                
                if (now < c.Start)
                {
                    string timeStr = $"{c.Start.ToString("hh:mm tt")} - {c.End.ToString("hh:mm tt")}";
                    return ("Early", $"You are early. Please wait for the professor.\n{c.Subj} - {c.Sec} | Prof. {c.Prof} | Room: {roomId} | {timeStr}");
                }
            }

            return ("Denied", "No scheduled class here at this time.");
        }
    }
}
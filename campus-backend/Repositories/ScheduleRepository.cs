using System.Data;
using Oracle.ManagedDataAccess.Client;
using campus_backend.Models;

namespace campus_backend.Repositories
{
    public class ScheduleRepository : IScheduleRepository
    {
        private readonly string _connectionString;

        public ScheduleRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleConnection") 
                ?? throw new InvalidOperationException("Oracle connection string is missing.");
        }

<<<<<<< HEAD
        // --- GET ALL SCHEDULES ---
        public async Task<IEnumerable<Schedule>> GetAllSchedulesAsync()
        {
            var schedules = new List<Schedule>();
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"
                    SELECT s.Schedule_ID, s.Subject_Code, sub.Title AS Subject_Title, 
                           s.Section_ID, sec.Section_Name, 
                           s.Professor_ID, u.First_Name || ' ' || u.Last_Name AS Professor_Name, 
                           s.Room_ID, r.Building, 
                           s.Time_Start, s.Time_End, s.Class_Days
                    FROM Schedules s
                    LEFT JOIN Subjects sub ON s.Subject_Code = sub.Subject_Code
                    LEFT JOIN Sections sec ON s.Section_ID = sec.Section_ID
                    LEFT JOIN Users u ON s.Professor_ID = u.User_ID
                    LEFT JOIN Rooms r ON s.Room_ID = r.Room_ID";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    await con.OpenAsync();
                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            schedules.Add(new Schedule
                            {
                                Schedule_ID = reader["Schedule_ID"].ToString(),
                                Subject_Code = reader["Subject_Code"].ToString(),
                                Subject_Title = reader["Subject_Title"].ToString(),
                                Section_ID = reader["Section_ID"].ToString(),
                                Section_Name = reader["Section_Name"].ToString(),
                                Professor_ID = reader["Professor_ID"].ToString(),
                                Professor_Name = reader["Professor_Name"].ToString(),
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
=======
>>>>>>> 06fa0a3888e78074df4696dedfc693e4e92f76fd
        public async Task CreateScheduleAsync(Schedule schedule)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
<<<<<<< HEAD
=======
                // Generate a random Schedule ID (e.g., SCH-8492)
>>>>>>> 06fa0a3888e78074df4696dedfc693e4e92f76fd
                Random rnd = new Random();
                string newId = $"SCH-{rnd.Next(1000, 9999)}";

                string sql = @"
                    INSERT INTO Schedules (Schedule_ID, Subject_Code, Section_ID, Professor_ID, Room_ID, Time_Start, Time_End, Class_Days) 
                    VALUES (:id, :subj, :sec, :prof, :room, :tstart, :tend, :days)";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", newId));
                    cmd.Parameters.Add(new OracleParameter("subj", schedule.Subject_Code));
                    cmd.Parameters.Add(new OracleParameter("sec", schedule.Section_ID));
                    cmd.Parameters.Add(new OracleParameter("prof", schedule.Professor_ID));
                    cmd.Parameters.Add(new OracleParameter("room", schedule.Room_ID));
                    cmd.Parameters.Add(new OracleParameter("tstart", schedule.Time_Start));
                    cmd.Parameters.Add(new OracleParameter("tend", schedule.Time_End));
                    cmd.Parameters.Add(new OracleParameter("days", schedule.Class_Days));

                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }
<<<<<<< HEAD

        // --- UPDATE SCHEDULE ---
        public async Task UpdateScheduleAsync(Schedule schedule)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"
                    UPDATE Schedules 
                    SET Subject_Code = :subj, Section_ID = :sec, Professor_ID = :prof, 
                        Room_ID = :room, Time_Start = :tstart, Time_End = :tend, Class_Days = :days 
                    WHERE Schedule_ID = :id";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("subj", schedule.Subject_Code));
                    cmd.Parameters.Add(new OracleParameter("sec", schedule.Section_ID));
                    cmd.Parameters.Add(new OracleParameter("prof", schedule.Professor_ID));
                    cmd.Parameters.Add(new OracleParameter("room", schedule.Room_ID));
                    cmd.Parameters.Add(new OracleParameter("tstart", schedule.Time_Start));
                    cmd.Parameters.Add(new OracleParameter("tend", schedule.Time_End));
                    cmd.Parameters.Add(new OracleParameter("days", schedule.Class_Days));
                    cmd.Parameters.Add(new OracleParameter("id", schedule.Schedule_ID));

                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }
=======
>>>>>>> 06fa0a3888e78074df4696dedfc693e4e92f76fd
    }
}
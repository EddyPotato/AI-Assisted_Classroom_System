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

        public async Task CreateScheduleAsync(Schedule schedule)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                // Generate a random Schedule ID (e.g., SCH-8492)
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
    }
}
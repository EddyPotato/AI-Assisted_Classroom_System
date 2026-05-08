using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;

namespace campus_backend.Repositories
{
    public class AttendanceRepository : IAttendanceRepository
    {
        private readonly string _connectionString;

        public AttendanceRepository(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection");
        }

        public async Task<string> GetCurrentPresenceAsync(string personId, string role)
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();
            string table = role == "student" ? "STUDENTS" : "USERS";
            string idCol = role == "student" ? "STUDENT_ID" : "USER_ID";

            var cmd = new OracleCommand($"SELECT CAMPUS_PRESENCE FROM CAMPUS_ADMIN.{table} WHERE {idCol} = :id", connection);
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
            updateCmd.Parameters.Add(new OracleParameter("pres", newPresence));
            updateCmd.Parameters.Add(new OracleParameter("id", personId));
            await updateCmd.ExecuteNonQueryAsync();

            var logCmd = new OracleCommand(@"
                INSERT INTO CAMPUS_ADMIN.EVENT_LOGS (STUDENT_ID, STATUS, TIMESTAMP, LOCATION_ID)
                VALUES (:id, :stat, SYSDATE, :loc)", connection);
            logCmd.Parameters.Add(new OracleParameter("id", personId));
            logCmd.Parameters.Add(new OracleParameter("stat", eventLogStatus));
            logCmd.Parameters.Add(new OracleParameter("loc", locationId));
            await logCmd.ExecuteNonQueryAsync();
        }
    }
}
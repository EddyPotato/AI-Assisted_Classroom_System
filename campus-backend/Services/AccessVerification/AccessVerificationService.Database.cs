using System;
using System.Threading.Tasks;
using Oracle.ManagedDataAccess.Client;

namespace campus_backend.Services
{
    public partial class AccessVerificationService
    {
        private async Task<(string presence, string table, string idCol)> GetCurrentPresenceAsync(OracleConnection connection)
        {
            string currentPresence = "offline";
            string tableToUpdate = "STUDENTS";
            string idColumn = "STUDENT_ID";

            var presCmd = new OracleCommand("SELECT CAMPUS_PRESENCE FROM CAMPUS_ADMIN.STUDENTS WHERE STUDENT_ID = :id", connection);
            presCmd.Parameters.Add(new OracleParameter("id", _pendingStudentId));
            using var presReader = await presCmd.ExecuteReaderAsync();
            
            if (await presReader.ReadAsync()) {
                currentPresence = presReader["CAMPUS_PRESENCE"]?.ToString() ?? "offline";
            }
            else {
                var userPresCmd = new OracleCommand("SELECT CAMPUS_PRESENCE FROM CAMPUS_ADMIN.USERS WHERE USER_ID = :id", connection);
                userPresCmd.Parameters.Add(new OracleParameter("id", _pendingStudentId));
                using var userPresReader = await userPresCmd.ExecuteReaderAsync();
                if (await userPresReader.ReadAsync()) {
                    currentPresence = userPresReader["CAMPUS_PRESENCE"]?.ToString() ?? "offline";
                    tableToUpdate = "USERS";
                    idColumn = "USER_ID";
                }
            }
            return (currentPresence, tableToUpdate, idColumn);
        }

        private async Task UpdatePresenceAndLogAsync(OracleConnection connection, string tableToUpdate, string idColumn, string newPresence, string eventLogStatus)
        {
            var updateCmd = new OracleCommand($"UPDATE CAMPUS_ADMIN.{tableToUpdate} SET CAMPUS_PRESENCE = :pres WHERE {idColumn} = :id", connection);
            updateCmd.Parameters.Add(new OracleParameter("pres", newPresence));
            updateCmd.Parameters.Add(new OracleParameter("id", _pendingStudentId));
            await updateCmd.ExecuteNonQueryAsync();

            var logCmd = new OracleCommand(@"
                INSERT INTO CAMPUS_ADMIN.EVENT_LOGS (STUDENT_ID, STATUS, TIMESTAMP, LOCATION_ID)
                VALUES (:id, :stat, SYSDATE, :loc)", connection);
            logCmd.Parameters.Add(new OracleParameter("id", _pendingStudentId));
            logCmd.Parameters.Add(new OracleParameter("stat", eventLogStatus));
            logCmd.Parameters.Add(new OracleParameter("loc", _currentLocationId));
            await logCmd.ExecuteNonQueryAsync();
        }
    }
}
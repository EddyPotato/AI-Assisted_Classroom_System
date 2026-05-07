using System;
using System.Threading.Tasks;
using Oracle.ManagedDataAccess.Client;

namespace campus_backend.Services
{
    public partial class AccessVerificationService
    {
        private (string newPres, string logStat, string finalStat) EvaluateGateLogic(string locationType, string currentPresence, string status)
        {
            string newPresence = currentPresence, eventLogStatus = "approved";
            if (locationType == "entrance") newPresence = "in-campus";
            else if (locationType == "exit")
            {
                if (currentPresence == "in-class") { eventLogStatus = "Cutting / Early Exit"; status = "cutting"; }
                newPresence = "offline";
            }
            return (newPresence, eventLogStatus, status);
        }

        private async Task<(string newPres, string logStat, string hint, string finalStat)> EvaluateRoomLogicAsync(
            OracleConnection connection, string tableToUpdate, string currentPresence, string? associatedRoomId, string status)
        {
            string newPresence = currentPresence, eventLogStatus = "approved", scanHint = "";
            if (tableToUpdate == "USERS") return ("in-class", eventLogStatus, scanHint, status);

            bool isEnrolled = false;
            string currentDay = DateTime.Now.ToString("ddd");
            DateTime now = DateTime.Now;

            var schedCmd = new OracleCommand(@"
                SELECT s.TIME_START, s.TIME_END FROM CAMPUS_ADMIN.SCHEDULES s
                JOIN CAMPUS_ADMIN.ENROLLMENTS e ON s.SECTION_ID = e.SECTION_ID
                WHERE s.ROOM_ID = :room AND e.STUDENT_ID = :sid AND s.CLASS_DAYS LIKE '%' || :day || '%'", connection);
            
            schedCmd.Parameters.Add(new OracleParameter("room", associatedRoomId));
            schedCmd.Parameters.Add(new OracleParameter("sid", _pendingStudentId));
            schedCmd.Parameters.Add(new OracleParameter("day", currentDay));
            
            using var schedReader = await schedCmd.ExecuteReaderAsync();
            while (await schedReader.ReadAsync())
            {
                if (DateTime.TryParse(schedReader["TIME_START"].ToString(), out DateTime startTime) && 
                    DateTime.TryParse(schedReader["TIME_END"]?.ToString(), out DateTime endTime))
                {
                    if (now >= startTime.AddMinutes(-45) && now <= endTime) {
                        isEnrolled = true; break;
                    }
                }
            }

            if (isEnrolled) { newPresence = "in-class"; }
            else {
                status = "denied"; eventLogStatus = "Invalid Schedule / Wrong Room";
                scanHint = "No scheduled class here.";
            }
            return (newPresence, eventLogStatus, scanHint, status);
        }
    }
}
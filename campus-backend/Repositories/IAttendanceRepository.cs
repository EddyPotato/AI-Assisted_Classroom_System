using System.Collections.Generic;
using System.Threading.Tasks;
using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface IAttendanceRepository
    {
        Task<string> GetCurrentPresenceAsync(string personId, string role);
        Task UpdatePresenceAndLogAsync(string personId, string role, string locationId, string newPresence, string eventLogStatus);
        
        Task<IEnumerable<Schedule>> GetTodaySchedulesForProfessorAsync(string professorId);
        Task<IEnumerable<RosterStudent>> GetScheduleRosterAndAttendanceAsync(string scheduleId);
    }
}
using System.Collections.Generic;
using System.Threading.Tasks;

namespace campus_backend.Repositories
{
    public interface IAttendanceRepository
    {
        Task<List<object>> GetTodaySchedulesForProfessorAsync(string professorId, string currentDay);
        Task<List<object>> GetScheduleRosterAndAttendanceAsync(string scheduleId);
    }
}
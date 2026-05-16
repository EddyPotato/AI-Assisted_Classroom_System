using System.Collections.Generic;
using System.Threading.Tasks;
using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface IScheduleRepository
    {
        // THE FIX: Added termId parameter so the Registrar only fetches schedules for a specific School Year/Semester
        Task<IEnumerable<Schedule>> GetAllSchedulesAsync(string termId = null);
        
        Task CreateScheduleAsync(Schedule schedule);
        Task UpdateScheduleAsync(Schedule schedule);
        Task DeleteScheduleAsync(string id);
        
        // THE FIX: Added termId to ensure bulk imported schedules are stamped with the correct academic term
        Task<int> BulkImportSchedulesAsync(List<BulkScheduleDto> schedules, string termId);
        
        Task<bool> IsStudentInClassNowAsync(string studentId, string roomId);
        Task<(string Status, string Message)> CheckStudentClassAccessAsync(string studentId, string roomId);
    }
}
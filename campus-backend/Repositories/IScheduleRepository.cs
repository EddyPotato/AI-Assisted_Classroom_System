using System.Collections.Generic;
using System.Threading.Tasks;
using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface IScheduleRepository
    {
        Task<IEnumerable<Schedule>> GetAllSchedulesAsync();
        Task CreateScheduleAsync(Schedule schedule);
        Task UpdateScheduleAsync(Schedule schedule);
        Task DeleteScheduleAsync(string id);
        Task<int> BulkImportSchedulesAsync(List<BulkScheduleDto> schedules);
        
        // Legacy boolean check (kept for backward compatibility in other parts of the system if any)
        Task<bool> IsStudentInClassNowAsync(string studentId, string roomId);
        
        // NEW: Advanced State Machine Checker returning Status and HCI Message
        Task<(string Status, string Message)> CheckStudentClassAccessAsync(string studentId, string roomId);
    }
}
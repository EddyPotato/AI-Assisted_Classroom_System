using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface IScheduleRepository
    {
<<<<<<< HEAD
        Task<IEnumerable<Schedule>> GetAllSchedulesAsync();
        Task CreateScheduleAsync(Schedule schedule);
        Task UpdateScheduleAsync(Schedule schedule);
=======
        Task CreateScheduleAsync(Schedule schedule);
>>>>>>> 06fa0a3888e78074df4696dedfc693e4e92f76fd
    }
}
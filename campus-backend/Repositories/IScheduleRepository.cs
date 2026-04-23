using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface IScheduleRepository
    {
        Task CreateScheduleAsync(Schedule schedule);
    }
}
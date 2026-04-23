using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface IRoomRepository
    {
        Task<IEnumerable<Room>> GetAllRoomsAsync();
    }
}
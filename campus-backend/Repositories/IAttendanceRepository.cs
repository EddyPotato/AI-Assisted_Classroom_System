using System.Threading.Tasks;

namespace campus_backend.Repositories
{
    public interface IAttendanceRepository
    {
        Task<string> GetCurrentPresenceAsync(string personId, string role);
        Task UpdatePresenceAndLogAsync(string personId, string role, string locationId, string newPresence, string eventLogStatus);
    }
}
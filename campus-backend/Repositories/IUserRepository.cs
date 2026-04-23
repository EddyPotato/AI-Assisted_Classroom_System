using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetUserByIdAsync(string userId);
        Task UpdatePasswordAsync(string userId, string hashedPassword);
    }
}
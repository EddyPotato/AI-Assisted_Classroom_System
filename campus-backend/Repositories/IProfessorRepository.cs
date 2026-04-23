using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface IProfessorRepository
    {
        Task<Professor?> GetProfessorByIdAsync(string professorId);
        Task UpdatePasswordAsync(string professorId, string hashedPassword);
    }
}
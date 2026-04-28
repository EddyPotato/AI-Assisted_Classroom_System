using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface IProfessorRepository
    {
        Task<IEnumerable<Professor>> GetAllProfessorsAsync();
        Task<Professor?> GetProfessorByIdAsync(string id);
        Task CreateProfessorAsync(Professor professor);
        Task UpdateProfessorAsync(Professor professor);
    }
}
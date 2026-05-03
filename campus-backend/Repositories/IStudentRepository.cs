using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface IStudentRepository
    {
        Task<Student?> GetStudentByIdAsync(string studentId);
        Task<IEnumerable<Student>> GetAllStudentsAsync();
        
        // NEW: Method to find the highest ID for a given year
        Task<string?> GetLatestStudentIdAsync(string yearPrefix);
        
        Task CreateStudentAsync(Student student);
        Task UpdateStudentAsync(Student student);
        Task DeleteStudentAsync(string id);
    }
}
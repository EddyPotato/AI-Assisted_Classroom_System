using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface IStudentRepository
    {
        Task<Student?> GetStudentByIdAsync(string studentId);
        Task<IEnumerable<Student>> GetAllStudentsAsync();
        Task CreateStudentAsync(Student student);
        
        // ADD THIS NEW METHOD:
        Task UpdateStudentAsync(Student student);
    }
}
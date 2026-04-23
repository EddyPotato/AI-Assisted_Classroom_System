using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface IStudentRepository
    {
        Task<Student?> GetStudentByIdAsync(string studentId);
        Task<IEnumerable<Student>> GetAllStudentsAsync(); // NEW
        Task CreateStudentAsync(Student student);         // NEW
    }
}
using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface IStudentRepository
    {
        Task<Student?> GetStudentByIdAsync(string studentId);
        Task<IEnumerable<Student>> GetAllStudentsAsync();
        Task<string?> GetLatestStudentIdAsync(string yearPrefix);
        Task CreateStudentAsync(Student student);
        Task UpdateStudentAsync(Student student);
        Task DeleteStudentAsync(string id);
    }
}
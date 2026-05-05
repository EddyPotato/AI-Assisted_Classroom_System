using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface ISectionRepository
    {
        Task<IEnumerable<SectionDTO>> GetAllSectionsAsync();
        Task<IEnumerable<Student>> GetStudentsInSectionAsync(string sectionId);
        Task<IEnumerable<SectionScheduleDTO>> GetSectionScheduleAsync(string sectionId);
        Task AddStudentsToSectionAsync(string sectionId, List<string> studentIds);
        Task RemoveStudentFromSectionAsync(string sectionId, string studentId);
    }
}
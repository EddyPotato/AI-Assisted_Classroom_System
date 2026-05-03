using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface ISectionRepository
    {
        Task<IEnumerable<Section>> GetAllSectionsAsync();
        Task<IEnumerable<RosterStudent>> GetSectionRosterAsync(string sectionId);
        Task CreateSectionAsync(Section section);
        Task DeleteSectionAsync(string id);
    }
}
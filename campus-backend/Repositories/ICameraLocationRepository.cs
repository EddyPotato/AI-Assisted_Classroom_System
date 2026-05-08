using System.Collections.Generic;
using System.Threading.Tasks;
using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface ICameraLocationRepository
    {
        Task<IEnumerable<CameraLocation>> GetAllActiveLocationsAsync();
        Task<CameraLocation> GetLocationByIdAsync(string locationId);
        Task<bool> CreateLocationAsync(CameraLocation location);
        Task<bool> UpdateLocationAsync(string locationId, CameraLocation location);
        Task<bool> DeleteLocationAsync(string locationId);
    }
}
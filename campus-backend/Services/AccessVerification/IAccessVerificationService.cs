using System.Threading.Tasks;

namespace campus_backend.Services
{
    public interface IAccessVerificationService
    {
        Task ProcessPhase1BarcodeAsync(string payload);
        Task ProcessPhase2VerificationAsync(string payload);
    }
}
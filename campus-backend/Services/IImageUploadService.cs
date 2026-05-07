using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace campus_backend.Services
{
    public interface IImageUploadService
    {
        Task<string?> UploadFaceReferenceAsync(IFormFile photo, string lastName, string id, string fileSuffix);
    }
}
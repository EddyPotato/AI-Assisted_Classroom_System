using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

namespace campus_backend.Services
{
    public class ImageUploadService : IImageUploadService
    {
        public async Task<string?> UploadFaceReferenceAsync(IFormFile photo, string lastName, string id, string fileSuffix)
        {
            if (photo == null || photo.Length == 0) return null;

            string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "ReferenceFaces");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            string safeLastName = string.IsNullOrWhiteSpace(lastName) ? "user" : lastName.ToLower().Trim();
            
            // Standardizes the format: e.g., "rodriguez_24-1507_face.jpg" or "olayon_PRO-0001_staff_face.jpg"
            string uniqueFileName = $"{safeLastName}_{id}_{fileSuffix}";
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);
            
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await photo.CopyToAsync(fileStream);
            }

            return uniqueFileName;
        }
    }
}
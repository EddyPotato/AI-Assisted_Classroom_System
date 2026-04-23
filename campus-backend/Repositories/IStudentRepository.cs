using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface IStudentRepository
    {
        Task<Student?> GetStudentByBarcodeAsync(string barcodeData);
    }
}
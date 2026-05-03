using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface IEnrollmentRepository
    {
        Task<int> BulkEnrollRegularStudentAsync(BulkEnrollmentRequest req);
        Task<int> CustomEnrollIrregularStudentAsync(CustomEnrollmentRequest req);
    }
}
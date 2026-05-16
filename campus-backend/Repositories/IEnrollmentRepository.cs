using System.Threading.Tasks;
using campus_backend.Models;

namespace campus_backend.Repositories
{
    public interface IEnrollmentRepository
    {
        // Models updated in Part 1 to accept Term_ID
        Task<int> BulkEnrollRegularStudentAsync(BulkEnrollmentRequest req);
        Task<int> CustomEnrollIrregularStudentAsync(CustomEnrollmentRequest req);
    }
}
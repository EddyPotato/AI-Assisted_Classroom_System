using System.Data;
using Oracle.ManagedDataAccess.Client;
using campus_backend.Models;

namespace campus_backend.Repositories
{
    public class EnrollmentRepository : IEnrollmentRepository
    {
        private readonly string _connectionString;

        public EnrollmentRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleConnection") 
                ?? throw new InvalidOperationException("Oracle connection string is missing.");
        }

        public async Task<int> BulkEnrollRegularStudentAsync(BulkEnrollmentRequest req)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"
                    INSERT INTO ENROLLMENTS (SCHEDULE_ID, STUDENT_ID)
                    SELECT SCHEDULE_ID, :studentId 
                    FROM SCHEDULES 
                    WHERE SECTION_ID = :sectionId
                    AND NOT EXISTS (
                        SELECT 1 FROM ENROLLMENTS e2 
                        WHERE e2.STUDENT_ID = :studentId2 AND e2.SCHEDULE_ID = SCHEDULES.SCHEDULE_ID
                    )";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("studentId", req.Student_ID));
                    cmd.Parameters.Add(new OracleParameter("sectionId", req.Section_ID));
                    cmd.Parameters.Add(new OracleParameter("studentId2", req.Student_ID)); 

                    await con.OpenAsync();
                    return await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task<int> CustomEnrollIrregularStudentAsync(CustomEnrollmentRequest req)
        {
            int insertedCount = 0;
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                await con.OpenAsync();
                foreach (var schedId in req.Schedule_IDs)
                {
                    try
                    {
                        string sql = "INSERT INTO ENROLLMENTS (SCHEDULE_ID, STUDENT_ID) VALUES (:schedId, :studentId)";
                        using (OracleCommand cmd = new OracleCommand(sql, con))
                        {
                            cmd.Parameters.Add(new OracleParameter("schedId", schedId));
                            cmd.Parameters.Add(new OracleParameter("studentId", req.Student_ID));
                            await cmd.ExecuteNonQueryAsync();
                            insertedCount++;
                        }
                    }
                    catch (OracleException ex) when (ex.Number == 1) // ORA-00001: Unique constraint
                    {
                        continue; 
                    }
                }
            }
            return insertedCount;
        }
    }
}
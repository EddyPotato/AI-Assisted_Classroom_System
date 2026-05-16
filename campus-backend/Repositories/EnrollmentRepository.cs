using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;
using campus_backend.Models;

namespace campus_backend.Repositories
{
    public class EnrollmentRepository : IEnrollmentRepository
    {
        private readonly string _connectionString;

        public EnrollmentRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? configuration.GetConnectionString("OracleConnection")
                ?? throw new InvalidOperationException("Oracle connection string is missing.");
        }

        public async Task<int> BulkEnrollRegularStudentAsync(BulkEnrollmentRequest req)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                await con.OpenAsync();

                // THE FIX: Check if already enrolled in this SECTION for this specific TERM
                string checkSql = @"
                    SELECT COUNT(*) FROM CAMPUS_ADMIN.ENROLLMENTS 
                    WHERE STUDENT_ID = :studentId 
                      AND SECTION_ID = :sectionId 
                      AND TERM_ID = :termId";

                using (OracleCommand checkCmd = new OracleCommand(checkSql, con))
                {
                    checkCmd.Parameters.Add(new OracleParameter("studentId", req.Student_ID));
                    checkCmd.Parameters.Add(new OracleParameter("sectionId", req.Section_ID));
                    checkCmd.Parameters.Add(new OracleParameter("termId", string.IsNullOrEmpty(req.Term_ID) ? (object)DBNull.Value : req.Term_ID));

                    int exists = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());
                    if (exists > 0) return 0; // Skip if already enrolled to prevent duplicates
                }

                // Generate a proper ID matching your schema's VARCHAR2(20) constraint
                string newId = $"ENR-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

                // THE FIX: Insert into the correct columns, ensuring TERM_ID is stamped permanently.
                string sql = @"
                    INSERT INTO CAMPUS_ADMIN.ENROLLMENTS 
                    (ENROLLMENT_ID, STUDENT_ID, SECTION_ID, TERM_ID, ENROLLMENT_DATE, ENROLLMENT_STATUS)
                    VALUES (:id, :studentId, :sectionId, :termId, SYSDATE, 'Enrolled')";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", newId));
                    cmd.Parameters.Add(new OracleParameter("studentId", req.Student_ID));
                    cmd.Parameters.Add(new OracleParameter("sectionId", req.Section_ID));
                    cmd.Parameters.Add(new OracleParameter("termId", string.IsNullOrEmpty(req.Term_ID) ? (object)DBNull.Value : req.Term_ID));

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

                // THE FIX: Irregular students pick multiple custom schedules. 
                // Since the ENROLLMENTS table maps to SECTION_ID, we must resolve the sections for these schedules first.
                var sectionIds = new HashSet<string>();

                foreach (var schedId in req.Schedule_IDs)
                {
                    string getSecSql = "SELECT SECTION_ID FROM CAMPUS_ADMIN.SCHEDULES WHERE SCHEDULE_ID = :schedId";
                    using (OracleCommand secCmd = new OracleCommand(getSecSql, con))
                    {
                        secCmd.Parameters.Add(new OracleParameter("schedId", schedId));
                        var result = await secCmd.ExecuteScalarAsync();
                        if (result != null && result != DBNull.Value)
                        {
                            sectionIds.Add(result.ToString());
                        }
                    }
                }

                // Now, safely enroll the student in each unique section resolved from their custom schedules
                foreach (var secId in sectionIds)
                {
                    string checkSql = @"
                        SELECT COUNT(*) FROM CAMPUS_ADMIN.ENROLLMENTS 
                        WHERE STUDENT_ID = :studentId 
                          AND SECTION_ID = :sectionId 
                          AND TERM_ID = :termId";

                    using (OracleCommand checkCmd = new OracleCommand(checkSql, con))
                    {
                        checkCmd.Parameters.Add(new OracleParameter("studentId", req.Student_ID));
                        checkCmd.Parameters.Add(new OracleParameter("sectionId", secId));
                        checkCmd.Parameters.Add(new OracleParameter("termId", string.IsNullOrEmpty(req.Term_ID) ? (object)DBNull.Value : req.Term_ID));

                        int exists = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());
                        if (exists > 0) continue; // Skip duplicates
                    }

                    string newId = $"ENR-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

                    string insertSql = @"
                        INSERT INTO CAMPUS_ADMIN.ENROLLMENTS 
                        (ENROLLMENT_ID, STUDENT_ID, SECTION_ID, TERM_ID, ENROLLMENT_DATE, ENROLLMENT_STATUS)
                        VALUES (:id, :studentId, :sectionId, :termId, SYSDATE, 'Enrolled')";

                    using (OracleCommand cmd = new OracleCommand(insertSql, con))
                    {
                        cmd.Parameters.Add(new OracleParameter("id", newId));
                        cmd.Parameters.Add(new OracleParameter("studentId", req.Student_ID));
                        cmd.Parameters.Add(new OracleParameter("sectionId", secId));
                        cmd.Parameters.Add(new OracleParameter("termId", string.IsNullOrEmpty(req.Term_ID) ? (object)DBNull.Value : req.Term_ID));

                        await cmd.ExecuteNonQueryAsync();
                        insertedCount++;
                    }
                }
            }
            return insertedCount;
        }
    }
}
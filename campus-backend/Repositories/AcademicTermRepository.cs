using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;
using campus_backend.Models;

namespace campus_backend.Repositories
{
    // Interface Definition
    public interface IAcademicTermRepository
    {
        Task<IEnumerable<AcademicTerm>> GetAllTermsAsync();
        Task<AcademicTerm> GetActiveTermAsync();
        Task CreateTermAsync(AcademicTerm term);
        Task UpdateTermAsync(AcademicTerm term);
        Task SetTermActiveAsync(string termId);
    }

    // Repository Implementation
    public class AcademicTermRepository : IAcademicTermRepository
    {
        private readonly string _connectionString;

        public AcademicTermRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? configuration.GetConnectionString("OracleConnection")
                ?? throw new InvalidOperationException("Oracle connection string is missing.");
        }

        public async Task<IEnumerable<AcademicTerm>> GetAllTermsAsync()
        {
            var terms = new List<AcademicTerm>();
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                // Order by Start Date descending so the newest terms appear first
                string sql = "SELECT TERM_ID, SCHOOL_YEAR, SEMESTER, IS_ACTIVE, START_DATE, END_DATE FROM CAMPUS_ADMIN.ACADEMIC_TERMS ORDER BY START_DATE DESC NULLS LAST";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    await con.OpenAsync();
                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            terms.Add(new AcademicTerm
                            {
                                Term_ID = reader["TERM_ID"].ToString(),
                                School_Year = reader["SCHOOL_YEAR"].ToString(),
                                Semester = reader["SEMESTER"].ToString(),
                                Is_Active = Convert.ToInt32(reader["IS_ACTIVE"]) == 1,
                                Start_Date = reader["START_DATE"] != DBNull.Value ? Convert.ToDateTime(reader["START_DATE"]) : null,
                                End_Date = reader["END_DATE"] != DBNull.Value ? Convert.ToDateTime(reader["END_DATE"]) : null
                            });
                        }
                    }
                }
            }
            return terms;
        }

        public async Task<AcademicTerm> GetActiveTermAsync()
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = "SELECT TERM_ID, SCHOOL_YEAR, SEMESTER, IS_ACTIVE, START_DATE, END_DATE FROM CAMPUS_ADMIN.ACADEMIC_TERMS WHERE IS_ACTIVE = 1 FETCH FIRST 1 ROWS ONLY";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    await con.OpenAsync();
                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new AcademicTerm
                            {
                                Term_ID = reader["TERM_ID"].ToString(),
                                School_Year = reader["SCHOOL_YEAR"].ToString(),
                                Semester = reader["SEMESTER"].ToString(),
                                Is_Active = true,
                                Start_Date = reader["START_DATE"] != DBNull.Value ? Convert.ToDateTime(reader["START_DATE"]) : null,
                                End_Date = reader["END_DATE"] != DBNull.Value ? Convert.ToDateTime(reader["END_DATE"]) : null
                            };
                        }
                    }
                }
            }
            return null;
        }

        public async Task CreateTermAsync(AcademicTerm term)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"
                    INSERT INTO CAMPUS_ADMIN.ACADEMIC_TERMS (TERM_ID, SCHOOL_YEAR, SEMESTER, IS_ACTIVE, START_DATE, END_DATE)
                    VALUES (:id, :sy, :sem, :isActive, :sDate, :eDate)";
                
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", term.Term_ID));
                    cmd.Parameters.Add(new OracleParameter("sy", term.School_Year));
                    cmd.Parameters.Add(new OracleParameter("sem", term.Semester));
                    cmd.Parameters.Add(new OracleParameter("isActive", term.Is_Active ? 1 : 0));
                    cmd.Parameters.Add(new OracleParameter("sDate", term.Start_Date.HasValue ? term.Start_Date.Value : DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("eDate", term.End_Date.HasValue ? term.End_Date.Value : DBNull.Value));

                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task UpdateTermAsync(AcademicTerm term)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"
                    UPDATE CAMPUS_ADMIN.ACADEMIC_TERMS 
                    SET SCHOOL_YEAR = :sy, SEMESTER = :sem, START_DATE = :sDate, END_DATE = :eDate
                    WHERE TERM_ID = :id";
                
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("sy", term.School_Year));
                    cmd.Parameters.Add(new OracleParameter("sem", term.Semester));
                    cmd.Parameters.Add(new OracleParameter("sDate", term.Start_Date.HasValue ? term.Start_Date.Value : DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("eDate", term.End_Date.HasValue ? term.End_Date.Value : DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("id", term.Term_ID));

                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task SetTermActiveAsync(string termId)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                await con.OpenAsync();
                
                // Use a database transaction to ensure atomicity
                using (OracleTransaction tx = con.BeginTransaction())
                {
                    try
                    {
                        // Step 1: Deactivate all currently active terms
                        string sqlDeactivate = "UPDATE CAMPUS_ADMIN.ACADEMIC_TERMS SET IS_ACTIVE = 0";
                        using (OracleCommand cmd1 = new OracleCommand(sqlDeactivate, con))
                        {
                            await cmd1.ExecuteNonQueryAsync();
                        }

                        // Step 2: Activate the requested term
                        string sqlActivate = "UPDATE CAMPUS_ADMIN.ACADEMIC_TERMS SET IS_ACTIVE = 1 WHERE TERM_ID = :id";
                        using (OracleCommand cmd2 = new OracleCommand(sqlActivate, con))
                        {
                            cmd2.Parameters.Add(new OracleParameter("id", termId));
                            await cmd2.ExecuteNonQueryAsync();
                        }

                        await tx.CommitAsync();
                    }
                    catch (Exception ex)
                    {
                        await tx.RollbackAsync();
                        Console.Error.WriteLine($"Transaction Error during SetTermActiveAsync: {ex.Message}");
                        throw; 
                    }
                }
            }
        }
    }
}
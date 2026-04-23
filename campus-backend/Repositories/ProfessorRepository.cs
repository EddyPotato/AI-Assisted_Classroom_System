using System.Data;
using Oracle.ManagedDataAccess.Client;
using campus_backend.Models;

namespace campus_backend.Repositories
{
    public class ProfessorRepository : IProfessorRepository
    {
        private readonly string _connectionString;

        public ProfessorRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleConnection") 
                ?? throw new InvalidOperationException("Oracle connection string is missing.");
        }

        public async Task<Professor?> GetProfessorByIdAsync(string professorId)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                // Fetch the password to be verified mathematically in the controller
                string sql = @"
                    SELECT Professor_ID, First_Name, Middle_Name, Last_Name, Password 
                    FROM Professors 
                    WHERE Professor_ID = :profId";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("profId", professorId));
                    await con.OpenAsync();

                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new Professor
                            {
                                Professor_ID = reader["Professor_ID"].ToString(),
                                First_Name = reader["First_Name"].ToString(),
                                Middle_Name = reader["Middle_Name"].ToString(),
                                Last_Name = reader["Last_Name"].ToString(),
                                Password = reader["Password"].ToString()
                            };
                        }
                        return null; 
                    }
                }
            }
        }

        public async Task UpdatePasswordAsync(string professorId, string hashedPassword)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = "UPDATE Professors SET Password = :pass WHERE Professor_ID = :profId";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("pass", hashedPassword));
                    cmd.Parameters.Add(new OracleParameter("profId", professorId));
                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }
    }
}
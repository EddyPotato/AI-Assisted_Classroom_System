using System.Data;
using campus_backend.Models;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;

namespace campus_backend.Repositories
{
    public class ProfessorRepository : IProfessorRepository
    {
        private readonly string _connectionString;

        public ProfessorRepository(IConfiguration configuration)
        {
            // THE FIX: Changed "OracleDbConnection" to "OracleConnection" to match appsettings.json
            _connectionString = configuration.GetConnectionString("OracleConnection") 
                                ?? throw new Exception("Database connection string missing.");
        }

        public async Task<IEnumerable<Professor>> GetAllProfessorsAsync()
        {
            var professors = new List<Professor>();

            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = "SELECT Professor_ID, First_Name, Last_Name, Department FROM Professors";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    await con.OpenAsync();
                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            professors.Add(new Professor
                            {
                                Professor_ID = reader["Professor_ID"].ToString() ?? "",
                                First_Name = reader["First_Name"].ToString() ?? "",
                                Last_Name = reader["Last_Name"].ToString() ?? "",
                                Department = reader["Department"].ToString() ?? ""
                            });
                        }
                    }
                }
            }
            return professors;
        }

        public async Task<Professor?> GetProfessorByIdAsync(string id)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = "SELECT Professor_ID, First_Name, Last_Name, Department FROM Professors WHERE Professor_ID = :id";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", id));
                    await con.OpenAsync();
                    
                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new Professor
                            {
                                Professor_ID = reader["Professor_ID"].ToString() ?? "",
                                First_Name = reader["First_Name"].ToString() ?? "",
                                Last_Name = reader["Last_Name"].ToString() ?? "",
                                Department = reader["Department"].ToString() ?? ""
                            };
                        }
                    }
                }
            }
            return null;
        }

        public async Task CreateProfessorAsync(Professor professor)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"
                    INSERT INTO Professors (Professor_ID, First_Name, Last_Name, Department) 
                    VALUES (:id, :fname, :lname, :dept)";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", professor.Professor_ID));
                    cmd.Parameters.Add(new OracleParameter("fname", professor.First_Name));
                    cmd.Parameters.Add(new OracleParameter("lname", professor.Last_Name));
                    cmd.Parameters.Add(new OracleParameter("dept", professor.Department));

                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task UpdateProfessorAsync(Professor professor)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"
                    UPDATE Professors 
                    SET First_Name = :fname, 
                        Last_Name = :lname, 
                        Department = :dept 
                    WHERE Professor_ID = :id";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("fname", professor.First_Name));
                    cmd.Parameters.Add(new OracleParameter("lname", professor.Last_Name));
                    cmd.Parameters.Add(new OracleParameter("dept", professor.Department));
                    cmd.Parameters.Add(new OracleParameter("id", professor.Professor_ID)); // WHERE clause last

                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }
    }
}
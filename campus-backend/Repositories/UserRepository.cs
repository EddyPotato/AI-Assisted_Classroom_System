using System.Data;
using Oracle.ManagedDataAccess.Client;
using campus_backend.Models;

namespace campus_backend.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly string _connectionString;

        public UserRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleConnection") 
                ?? throw new InvalidOperationException("Oracle connection string is missing.");
        }

        public async Task<User?> GetUserByIdAsync(string userId)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                // Updated to select the Middle_Name
                string sql = @"
                    SELECT User_ID, First_Name, Middle_Name, Last_Name, Password, Role 
                    FROM Users 
                    WHERE User_ID = :userId";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("userId", userId));
                    await con.OpenAsync();

                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new User
                            {
                                User_ID = reader["User_ID"].ToString(),
                                First_Name = reader["First_Name"].ToString(),
                                Middle_Name = reader["Middle_Name"].ToString(), // Mapped Middle Name
                                Last_Name = reader["Last_Name"].ToString(),
                                Password = reader["Password"].ToString(),
                                Role = reader["Role"].ToString()
                            };
                        }
                        return null; 
                    }
                }
            }
        }

        public async Task UpdatePasswordAsync(string userId, string hashedPassword)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = "UPDATE Users SET Password = :pass WHERE User_ID = :userId";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("pass", hashedPassword));
                    cmd.Parameters.Add(new OracleParameter("userId", userId));
                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }
    }
}
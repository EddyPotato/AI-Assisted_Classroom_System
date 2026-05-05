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
                ?? throw new InvalidOperationException("Oracle connection string missing.");
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            var users = new List<User>();
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                // We do NOT select the password here for security!
                string sql = "SELECT USER_ID, FIRST_NAME, MIDDLE_NAME, LAST_NAME, ROLE FROM USERS ORDER BY LAST_NAME ASC";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    await con.OpenAsync();
                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            users.Add(new User
                            {
                                User_ID = reader["USER_ID"]?.ToString() ?? "",
                                First_Name = reader["FIRST_NAME"]?.ToString() ?? "",
                                Middle_Name = reader["MIDDLE_NAME"]?.ToString(),
                                Last_Name = reader["LAST_NAME"]?.ToString() ?? "",
                                Role = reader["ROLE"]?.ToString() ?? ""
                            });
                        }
                    }
                }
            }
            return users;
        }

        public async Task<User?> GetUserByIdAsync(string id)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = "SELECT USER_ID, FIRST_NAME, MIDDLE_NAME, LAST_NAME, ROLE FROM USERS WHERE USER_ID = :id";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", id));
                    await con.OpenAsync();
                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new User
                            {
                                User_ID = reader["USER_ID"]?.ToString() ?? "",
                                First_Name = reader["FIRST_NAME"]?.ToString() ?? "",
                                Middle_Name = reader["MIDDLE_NAME"]?.ToString(),
                                Last_Name = reader["LAST_NAME"]?.ToString() ?? "",
                                Role = reader["ROLE"]?.ToString() ?? ""
                            };
                        }
                        return null;
                    }
                }
            }
        }

        public async Task CreateUserAsync(User user)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"INSERT INTO USERS (USER_ID, FIRST_NAME, MIDDLE_NAME, LAST_NAME, PASSWORD, ROLE) 
                               VALUES (:id, :fname, :mname, :lname, :pass, :role)";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", user.User_ID));
                    cmd.Parameters.Add(new OracleParameter("fname", user.First_Name));
                    cmd.Parameters.Add(new OracleParameter("mname", string.IsNullOrEmpty(user.Middle_Name) ? DBNull.Value : user.Middle_Name));
                    cmd.Parameters.Add(new OracleParameter("lname", user.Last_Name));
                    cmd.Parameters.Add(new OracleParameter("pass", user.Password ?? "default123")); // Ideally hashed in production
                    cmd.Parameters.Add(new OracleParameter("role", user.Role));

                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task UpdateUserAsync(User user)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                // If the frontend sends a blank password, we only update the profile info
                string sql = string.IsNullOrEmpty(user.Password) 
                    ? "UPDATE USERS SET FIRST_NAME = :fname, MIDDLE_NAME = :mname, LAST_NAME = :lname, ROLE = :role WHERE USER_ID = :id"
                    : "UPDATE USERS SET FIRST_NAME = :fname, MIDDLE_NAME = :mname, LAST_NAME = :lname, ROLE = :role, PASSWORD = :pass WHERE USER_ID = :id";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("fname", user.First_Name));
                    cmd.Parameters.Add(new OracleParameter("mname", string.IsNullOrEmpty(user.Middle_Name) ? DBNull.Value : user.Middle_Name));
                    cmd.Parameters.Add(new OracleParameter("lname", user.Last_Name));
                    cmd.Parameters.Add(new OracleParameter("role", user.Role));
                    
                    if (!string.IsNullOrEmpty(user.Password))
                    {
                        cmd.Parameters.Add(new OracleParameter("pass", user.Password));
                    }
                    
                    cmd.Parameters.Add(new OracleParameter("id", user.User_ID));

                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task DeleteUserAsync(string id)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = "DELETE FROM USERS WHERE USER_ID = :id";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", id));
                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }
    }
}
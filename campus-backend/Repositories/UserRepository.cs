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
                // Never return the password in standard queries!
                string sql = "SELECT USER_ID, FIRST_NAME, MIDDLE_NAME, LAST_NAME, ROLE, EMAIL, CONTACT_NUMBER, ADDRESS, STATUS, FACE_REFERENCE_PATH FROM USERS ORDER BY LAST_NAME ASC";
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
                                Role = reader["ROLE"]?.ToString() ?? "",
                                Email = reader["EMAIL"]?.ToString(),
                                Contact_Number = reader["CONTACT_NUMBER"]?.ToString(),
                                Address = reader["ADDRESS"]?.ToString(),
                                Status = reader["STATUS"]?.ToString() ?? "Active",
                                Face_Reference_Path = reader["FACE_REFERENCE_PATH"]?.ToString()
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
                string sql = "SELECT USER_ID, FIRST_NAME, MIDDLE_NAME, LAST_NAME, PASSWORD, ROLE, EMAIL, CONTACT_NUMBER, ADDRESS, STATUS, FACE_REFERENCE_PATH FROM USERS WHERE USER_ID = :id";
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
                                Password = reader["PASSWORD"]?.ToString(),
                                Role = reader["ROLE"]?.ToString() ?? "",
                                Email = reader["EMAIL"]?.ToString(),
                                Contact_Number = reader["CONTACT_NUMBER"]?.ToString(),
                                Address = reader["ADDRESS"]?.ToString(),
                                Status = reader["STATUS"]?.ToString() ?? "Active",
                                Face_Reference_Path = reader["FACE_REFERENCE_PATH"]?.ToString()
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
                string sql = @"INSERT INTO USERS 
                              (USER_ID, FIRST_NAME, MIDDLE_NAME, LAST_NAME, PASSWORD, ROLE, EMAIL, CONTACT_NUMBER, ADDRESS, STATUS, FACE_REFERENCE_PATH) 
                               VALUES 
                              (:id, :fname, :mname, :lname, :pass, :role, :email, :contact, :address, :status, :face)";
                
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", user.User_ID));
                    cmd.Parameters.Add(new OracleParameter("fname", user.First_Name));
                    cmd.Parameters.Add(new OracleParameter("mname", string.IsNullOrEmpty(user.Middle_Name) ? (object)DBNull.Value : user.Middle_Name));
                    cmd.Parameters.Add(new OracleParameter("lname", user.Last_Name));
                    cmd.Parameters.Add(new OracleParameter("pass", user.Password ?? "default123")); // Replace with hashing in production
                    cmd.Parameters.Add(new OracleParameter("role", user.Role));
                    cmd.Parameters.Add(new OracleParameter("email", string.IsNullOrEmpty(user.Email) ? (object)DBNull.Value : user.Email));
                    cmd.Parameters.Add(new OracleParameter("contact", string.IsNullOrEmpty(user.Contact_Number) ? (object)DBNull.Value : user.Contact_Number));
                    cmd.Parameters.Add(new OracleParameter("address", string.IsNullOrEmpty(user.Address) ? (object)DBNull.Value : user.Address));
                    cmd.Parameters.Add(new OracleParameter("status", user.Status));
                    cmd.Parameters.Add(new OracleParameter("face", string.IsNullOrEmpty(user.Face_Reference_Path) ? (object)DBNull.Value : user.Face_Reference_Path));

                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task UpdateUserAsync(User user)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                // Dynamic SQL Builder: Only update fields that are provided
                var setClauses = new List<string>
                {
                    "FIRST_NAME = :fname",
                    "MIDDLE_NAME = :mname",
                    "LAST_NAME = :lname",
                    "ROLE = :role",
                    "EMAIL = :email",
                    "CONTACT_NUMBER = :contact",
                    "ADDRESS = :address",
                    "STATUS = :status"
                };

                if (!string.IsNullOrEmpty(user.Password)) setClauses.Add("PASSWORD = :pass");
                if (!string.IsNullOrEmpty(user.Face_Reference_Path)) setClauses.Add("FACE_REFERENCE_PATH = :face");

                string sql = $"UPDATE USERS SET {string.Join(", ", setClauses)} WHERE USER_ID = :id";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("fname", user.First_Name));
                    cmd.Parameters.Add(new OracleParameter("mname", string.IsNullOrEmpty(user.Middle_Name) ? (object)DBNull.Value : user.Middle_Name));
                    cmd.Parameters.Add(new OracleParameter("lname", user.Last_Name));
                    cmd.Parameters.Add(new OracleParameter("role", user.Role));
                    cmd.Parameters.Add(new OracleParameter("email", string.IsNullOrEmpty(user.Email) ? (object)DBNull.Value : user.Email));
                    cmd.Parameters.Add(new OracleParameter("contact", string.IsNullOrEmpty(user.Contact_Number) ? (object)DBNull.Value : user.Contact_Number));
                    cmd.Parameters.Add(new OracleParameter("address", string.IsNullOrEmpty(user.Address) ? (object)DBNull.Value : user.Address));
                    cmd.Parameters.Add(new OracleParameter("status", user.Status));

                    if (!string.IsNullOrEmpty(user.Password))
                    {
                        cmd.Parameters.Add(new OracleParameter("pass", user.Password));
                    }
                    if (!string.IsNullOrEmpty(user.Face_Reference_Path))
                    {
                        cmd.Parameters.Add(new OracleParameter("face", user.Face_Reference_Path));
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

        // Used by AuthController to reset passwords securely
        public async Task UpdatePasswordAsync(string id, string newPassword)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = "UPDATE USERS SET PASSWORD = :pass WHERE USER_ID = :id";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("pass", newPassword));
                    cmd.Parameters.Add(new OracleParameter("id", id));

                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }
    }
}
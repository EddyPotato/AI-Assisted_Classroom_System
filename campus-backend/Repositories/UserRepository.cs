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
                // ADDED: LATES_COUNT
                string sql = "SELECT USER_ID, FIRST_NAME, MIDDLE_NAME, LAST_NAME, ROLE, EMAIL, CONTACT_NUMBER, ADDRESS, STATUS, FACE_REFERENCE_PATH, LATES_COUNT FROM USERS ORDER BY LAST_NAME ASC";
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
                                Face_Reference_Path = reader["FACE_REFERENCE_PATH"]?.ToString(),
                                Lates_Count = reader["LATES_COUNT"] != DBNull.Value ? Convert.ToInt32(reader["LATES_COUNT"]) : 0
                            });
                        }
                    }
                }
            }
            return users;
        }

        // THE FIX: Added PASSWORD to the SELECT statement and mapped it in the reader
        public async Task<User?> GetUserByIdAsync(string id)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                // THE FIX: Added 'PASSWORD' to the SELECT statement
                string sql = "SELECT USER_ID, FIRST_NAME, MIDDLE_NAME, LAST_NAME, PASSWORD, ROLE, EMAIL, CONTACT_NUMBER, ADDRESS, STATUS, FACE_REFERENCE_PATH, LATES_COUNT FROM USERS WHERE USER_ID = :id";
                
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
                                
                                // THE FIX: Map the password from the database so AuthController can read it
                                Password = reader["PASSWORD"]?.ToString(), 
                                
                                Role = reader["ROLE"]?.ToString() ?? "",
                                Email = reader["EMAIL"]?.ToString(),
                                Contact_Number = reader["CONTACT_NUMBER"]?.ToString(),
                                Address = reader["ADDRESS"]?.ToString(),
                                Status = reader["STATUS"]?.ToString() ?? "Active",
                                Face_Reference_Path = reader["FACE_REFERENCE_PATH"]?.ToString(),
                                Lates_Count = reader["LATES_COUNT"] != DBNull.Value ? Convert.ToInt32(reader["LATES_COUNT"]) : 0
                            };
                        }
                    }
                }
            }
            return null;
        }

        public async Task CreateUserAsync(User user)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"INSERT INTO USERS 
                               (USER_ID, FIRST_NAME, MIDDLE_NAME, LAST_NAME, PASSWORD, ROLE, EMAIL, CONTACT_NUMBER, ADDRESS, STATUS, FACE_REFERENCE_PATH, LATES_COUNT) 
                               VALUES (:id, :fname, :mname, :lname, :pass, :role, :email, :contact, :address, :status, :face, :lates)";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", user.User_ID));
                    cmd.Parameters.Add(new OracleParameter("fname", user.First_Name));
                    cmd.Parameters.Add(new OracleParameter("mname", (object?)user.Middle_Name ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("lname", user.Last_Name));
                    cmd.Parameters.Add(new OracleParameter("pass", (object?)user.Password ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("role", user.Role));
                    cmd.Parameters.Add(new OracleParameter("email", (object?)user.Email ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("contact", (object?)user.Contact_Number ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("address", (object?)user.Address ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("status", user.Status));
                    cmd.Parameters.Add(new OracleParameter("face", (object?)user.Face_Reference_Path ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("lates", user.Lates_Count));

                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task UpdateUserAsync(User user)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"UPDATE USERS SET 
                               FIRST_NAME = :fname, MIDDLE_NAME = :mname, LAST_NAME = :lname, ROLE = :role, 
                               EMAIL = :email, CONTACT_NUMBER = :contact, ADDRESS = :address, STATUS = :status, 
                               FACE_REFERENCE_PATH = :face, LATES_COUNT = :lates 
                               WHERE USER_ID = :id";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("fname", user.First_Name));
                    cmd.Parameters.Add(new OracleParameter("mname", (object?)user.Middle_Name ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("lname", user.Last_Name));
                    cmd.Parameters.Add(new OracleParameter("role", user.Role));
                    cmd.Parameters.Add(new OracleParameter("email", (object?)user.Email ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("contact", (object?)user.Contact_Number ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("address", (object?)user.Address ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("status", user.Status));
                    cmd.Parameters.Add(new OracleParameter("face", (object?)user.Face_Reference_Path ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("lates", user.Lates_Count));
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
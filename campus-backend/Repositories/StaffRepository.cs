using System.Data;
using campus_backend.Models;
using Oracle.ManagedDataAccess.Client;

namespace campus_backend.Repositories
{
    public class StaffRepository : IStaffRepository
    {
        private readonly string _connectionString;
        public StaffRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleConnection") ?? throw new Exception("DB string missing.");
        }

        public async Task<IEnumerable<Staff>> GetAllStaffAsync()
        {
            var staffList = new List<Staff>();
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = "SELECT USER_ID, FIRST_NAME, MIDDLE_NAME, LAST_NAME, ROLE, EMAIL, CONTACT_NUMBER, ADDRESS, STATUS, FACE_REFERENCE_PATH, LATES_COUNT FROM USERS WHERE ROLE != 'Principal'";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    await con.OpenAsync();
                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            staffList.Add(new Staff
                            {
                                User_ID = reader["USER_ID"].ToString() ?? "",
                                First_Name = reader["FIRST_NAME"].ToString() ?? "",
                                Middle_Name = reader["MIDDLE_NAME"]?.ToString(),
                                Last_Name = reader["LAST_NAME"].ToString() ?? "",
                                Role = reader["ROLE"].ToString() ?? "",
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
            return staffList;
        }

        public async Task<Staff?> GetStaffByIdAsync(string id)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = "SELECT USER_ID, FIRST_NAME, MIDDLE_NAME, LAST_NAME, ROLE, EMAIL, CONTACT_NUMBER, ADDRESS, STATUS, FACE_REFERENCE_PATH, LATES_COUNT FROM USERS WHERE USER_ID = :id AND ROLE != 'Principal'";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", id));
                    await con.OpenAsync();
                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new Staff
                            {
                                User_ID = reader["USER_ID"].ToString() ?? "",
                                First_Name = reader["FIRST_NAME"].ToString() ?? "",
                                Middle_Name = reader["MIDDLE_NAME"]?.ToString(),
                                Last_Name = reader["LAST_NAME"].ToString() ?? "",
                                Role = reader["ROLE"].ToString() ?? "",
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

        public async Task CreateStaffAsync(Staff staff)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"INSERT INTO USERS 
                               (USER_ID, FIRST_NAME, MIDDLE_NAME, LAST_NAME, ROLE, EMAIL, CONTACT_NUMBER, ADDRESS, STATUS, FACE_REFERENCE_PATH, LATES_COUNT) 
                               VALUES (:id, :fname, :mname, :lname, :role, :email, :contact, :address, :status, :face, :lates)";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", staff.User_ID));
                    cmd.Parameters.Add(new OracleParameter("fname", staff.First_Name));
                    cmd.Parameters.Add(new OracleParameter("mname", (object?)staff.Middle_Name ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("lname", staff.Last_Name));
                    cmd.Parameters.Add(new OracleParameter("role", staff.Role));
                    cmd.Parameters.Add(new OracleParameter("email", (object?)staff.Email ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("contact", (object?)staff.Contact_Number ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("address", (object?)staff.Address ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("status", staff.Status));
                    cmd.Parameters.Add(new OracleParameter("face", (object?)staff.Face_Reference_Path ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("lates", staff.Lates_Count));
                    
                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task UpdateStaffAsync(Staff staff)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"UPDATE USERS SET 
                               FIRST_NAME = :fname, MIDDLE_NAME = :mname, LAST_NAME = :lname, ROLE = :role, 
                               EMAIL = :email, CONTACT_NUMBER = :contact, ADDRESS = :address, STATUS = :status, 
                               LATES_COUNT = :lates WHERE USER_ID = :id";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("fname", staff.First_Name));
                    cmd.Parameters.Add(new OracleParameter("mname", (object?)staff.Middle_Name ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("lname", staff.Last_Name));
                    cmd.Parameters.Add(new OracleParameter("role", staff.Role));
                    cmd.Parameters.Add(new OracleParameter("email", (object?)staff.Email ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("contact", (object?)staff.Contact_Number ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("address", (object?)staff.Address ?? DBNull.Value));
                    cmd.Parameters.Add(new OracleParameter("status", staff.Status));
                    cmd.Parameters.Add(new OracleParameter("lates", staff.Lates_Count));
                    cmd.Parameters.Add(new OracleParameter("id", staff.User_ID)); 
                    
                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task DeleteStaffAsync(string id)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = "DELETE FROM USERS WHERE USER_ID = :id AND ROLE != 'Principal'";
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
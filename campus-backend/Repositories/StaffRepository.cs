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
                string sql = "SELECT USER_ID, FIRST_NAME, MIDDLE_NAME, LAST_NAME, ROLE FROM USERS WHERE ROLE != 'Principal'";
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
                                Middle_Name = reader["MIDDLE_NAME"].ToString() ?? "",
                                Last_Name = reader["LAST_NAME"].ToString() ?? "",
                                Role = reader["ROLE"].ToString() ?? ""
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
                string sql = "SELECT USER_ID, FIRST_NAME, MIDDLE_NAME, LAST_NAME, ROLE FROM USERS WHERE USER_ID = :id";
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
                                Middle_Name = reader["MIDDLE_NAME"].ToString() ?? "",
                                Last_Name = reader["LAST_NAME"].ToString() ?? "",
                                Role = reader["ROLE"].ToString() ?? ""
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
                string defaultHash = "$2a$11$133L3OF9MW5QelxKtNc3KuDuj8ZSvK5mXuks/TmsLtx7GPqC.lQg."; 
                string sql = "INSERT INTO USERS (USER_ID, FIRST_NAME, MIDDLE_NAME, LAST_NAME, ROLE, PASSWORD) VALUES (:id, :fname, :mname, :lname, :role, :pass)";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", staff.User_ID));
                    cmd.Parameters.Add(new OracleParameter("fname", staff.First_Name));
                    cmd.Parameters.Add(new OracleParameter("mname", string.IsNullOrEmpty(staff.Middle_Name) ? DBNull.Value : staff.Middle_Name));
                    cmd.Parameters.Add(new OracleParameter("lname", staff.Last_Name));
                    cmd.Parameters.Add(new OracleParameter("role", staff.Role));
                    cmd.Parameters.Add(new OracleParameter("pass", defaultHash));
                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task UpdateStaffAsync(Staff staff)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = "UPDATE USERS SET FIRST_NAME = :fname, MIDDLE_NAME = :mname, LAST_NAME = :lname, ROLE = :role WHERE USER_ID = :id";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("fname", staff.First_Name));
                    cmd.Parameters.Add(new OracleParameter("mname", string.IsNullOrEmpty(staff.Middle_Name) ? DBNull.Value : staff.Middle_Name));
                    cmd.Parameters.Add(new OracleParameter("lname", staff.Last_Name));
                    cmd.Parameters.Add(new OracleParameter("role", staff.Role));
                    cmd.Parameters.Add(new OracleParameter("id", staff.User_ID)); 
                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        // --- DELETE STAFF MEMBER ---
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
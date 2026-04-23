using System.Data;
using Oracle.ManagedDataAccess.Client;
using campus_backend.Models;

namespace campus_backend.Repositories
{
    public class RoomRepository : IRoomRepository
    {
        private readonly string _connectionString;

        public RoomRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleConnection") 
                ?? throw new InvalidOperationException("Oracle connection string is missing.");
        }

        public async Task<IEnumerable<Room>> GetAllRoomsAsync()
        {
            var rooms = new List<Room>();

            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                // We JOIN the Rooms table with the Users table to get the Faculty's full name
                string sql = @"
                    SELECT r.Room_ID, r.Room_Name, r.Room_Type, r.Capacity, r.Status, r.Assigned_Faculty_ID,
                           u.First_Name, u.Last_Name
                    FROM Rooms r
                    LEFT JOIN Users u ON r.Assigned_Faculty_ID = u.User_ID";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    await con.OpenAsync();

                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            string facultyName = "Unassigned";
                            if (reader["First_Name"] != DBNull.Value && reader["Last_Name"] != DBNull.Value)
                            {
                                facultyName = $"{reader["First_Name"]} {reader["Last_Name"]}";
                            }

                            rooms.Add(new Room
                            {
                                Room_ID = reader["Room_ID"].ToString(),
                                Room_Name = reader["Room_Name"].ToString(),
                                Room_Type = reader["Room_Type"].ToString(),
                                Capacity = Convert.ToInt32(reader["Capacity"]),
                                Status = reader["Status"].ToString(),
                                Assigned_Faculty_ID = reader["Assigned_Faculty_ID"]?.ToString(),
                                Faculty_Name = facultyName
                            });
                        }
                    }
                }
            }
            return rooms;
        }
    }
}
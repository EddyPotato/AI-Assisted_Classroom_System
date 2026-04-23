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
                // Clean, direct query for our normalized table
                string sql = "SELECT Room_ID, Building, Floor, Room_Type, Status FROM Rooms";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    await con.OpenAsync();

                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            rooms.Add(new Room
                            {
                                Room_ID = reader["Room_ID"].ToString(),
                                Building = reader["Building"].ToString(),
                                Floor = Convert.ToInt32(reader["Floor"]),
                                Room_Type = reader["Room_Type"].ToString(),
                                Status = reader["Status"].ToString()
                            });
                        }
                    }
                }
            }
            return rooms;
        }
    }
}
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;
using campus_backend.Models;

namespace campus_backend.Repositories
{
    public class CameraLocationRepository : ICameraLocationRepository
    {
        private readonly string _connectionString;

        public CameraLocationRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? configuration.GetConnectionString("OracleConnection")
                ?? configuration.GetConnectionString("OracleDb")
                ?? throw new InvalidOperationException("Connection string not found.");
        }

        public async Task<IEnumerable<CameraLocation>> GetAllActiveLocationsAsync()
        {
            var locations = new List<CameraLocation>();
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            var query = "SELECT * FROM CAMPUS_ADMIN.CAMERA_LOCATIONS WHERE IS_ACTIVE = 1 ORDER BY CREATED_AT";
            using var cmd = new OracleCommand(query, connection);
            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                locations.Add(new CameraLocation
                {
                    Location_ID = reader["LOCATION_ID"].ToString(),
                    Camera_Name = reader["CAMERA_NAME"].ToString(),
                    Logic_Type = reader["LOGIC_TYPE"]?.ToString() ?? "gate",
                    Location_Type = reader["LOCATION_TYPE"]?.ToString(),
                    Associated_Room_ID = reader["ASSOCIATED_ROOM_ID"] != DBNull.Value ? reader["ASSOCIATED_ROOM_ID"].ToString() : null,
                    Status_On_Scan = reader["STATUS_ON_SCAN"]?.ToString(),
                    Is_Active = Convert.ToInt32(reader["IS_ACTIVE"]) == 1,
                    Created_At = Convert.ToDateTime(reader["CREATED_AT"])
                });
            }
            return locations;
        }

        public async Task<CameraLocation> GetLocationByIdAsync(string locationId)
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            var query = "SELECT * FROM CAMPUS_ADMIN.CAMERA_LOCATIONS WHERE LOCATION_ID = :id";
            using var cmd = new OracleCommand(query, connection);
            cmd.Parameters.Add(new OracleParameter("id", locationId));
            
            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new CameraLocation
                {
                    Location_ID = reader["LOCATION_ID"].ToString(),
                    Camera_Name = reader["CAMERA_NAME"].ToString(),
                    Logic_Type = reader["LOGIC_TYPE"]?.ToString() ?? "gate",
                    Location_Type = reader["LOCATION_TYPE"]?.ToString(),
                    Associated_Room_ID = reader["ASSOCIATED_ROOM_ID"] != DBNull.Value ? reader["ASSOCIATED_ROOM_ID"].ToString() : null,
                    Status_On_Scan = reader["STATUS_ON_SCAN"]?.ToString(),
                    Is_Active = Convert.ToInt32(reader["IS_ACTIVE"]) == 1,
                    Created_At = Convert.ToDateTime(reader["CREATED_AT"])
                };
            }
            return null;
        }

        public async Task<bool> CreateLocationAsync(CameraLocation location)
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"INSERT INTO CAMPUS_ADMIN.CAMERA_LOCATIONS
                          (LOCATION_ID, CAMERA_NAME, LOGIC_TYPE, LOCATION_TYPE, ASSOCIATED_ROOM_ID, STATUS_ON_SCAN, IS_ACTIVE)
                          VALUES (:id, :name, :logic, :type, :room, :status, :active)";
            
            using var cmd = new OracleCommand(query, connection);
            cmd.Parameters.Add(new OracleParameter("id", location.Location_ID));
            cmd.Parameters.Add(new OracleParameter("name", location.Camera_Name));
            cmd.Parameters.Add(new OracleParameter("logic", location.Logic_Type ?? "gate"));
            cmd.Parameters.Add(new OracleParameter("type", location.Location_Type));
            cmd.Parameters.Add(new OracleParameter("room", (object)location.Associated_Room_ID ?? DBNull.Value));
            cmd.Parameters.Add(new OracleParameter("status", location.Status_On_Scan));
            cmd.Parameters.Add(new OracleParameter("active", location.Is_Active ? 1 : 0));

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

        public async Task<bool> UpdateLocationAsync(string locationId, CameraLocation location)
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"UPDATE CAMPUS_ADMIN.CAMERA_LOCATIONS
                          SET CAMERA_NAME = :name, LOGIC_TYPE = :logic, LOCATION_TYPE = :type, 
                              ASSOCIATED_ROOM_ID = :room, STATUS_ON_SCAN = :status, IS_ACTIVE = :active
                          WHERE LOCATION_ID = :id";
            
            using var cmd = new OracleCommand(query, connection);
            cmd.Parameters.Add(new OracleParameter("name", location.Camera_Name));
            cmd.Parameters.Add(new OracleParameter("logic", location.Logic_Type ?? "gate"));
            cmd.Parameters.Add(new OracleParameter("type", location.Location_Type));
            cmd.Parameters.Add(new OracleParameter("room", (object)location.Associated_Room_ID ?? DBNull.Value));
            cmd.Parameters.Add(new OracleParameter("status", location.Status_On_Scan));
            cmd.Parameters.Add(new OracleParameter("active", location.Is_Active ? 1 : 0));
            cmd.Parameters.Add(new OracleParameter("id", locationId));

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }
    }
}
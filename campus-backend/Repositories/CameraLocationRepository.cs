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
                ?? throw new InvalidOperationException("Connection string not found. Ensure 'DefaultConnection' or 'OracleConnection' is configured in appsettings.json");
        }

        public async Task<IEnumerable<CameraLocation>> GetAllActiveLocationsAsync()
        {
            var locations = new List<CameraLocation>();
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            var query = "SELECT LOCATION_ID, CAMERA_NAME, LOGIC_TYPE, LOCATION_TYPE, ASSOCIATED_ROOM_ID, IS_ACTIVE FROM CAMPUS_ADMIN.CAMERA_LOCATIONS";
            using var cmd = new OracleCommand(query, connection);
            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                locations.Add(new CameraLocation
                {
                    Location_ID = reader["LOCATION_ID"].ToString(),
                    Camera_Name = reader["CAMERA_NAME"].ToString(),
                    Logic_Type = reader["LOGIC_TYPE"].ToString(),
                    Location_Type = reader["LOCATION_TYPE"].ToString(),
                    Associated_Room_ID = reader["ASSOCIATED_ROOM_ID"]?.ToString(),
                    
                    // Handles Oracle's numeric boolean representation (1 = true, 0 = false)
                    Is_Active = reader["IS_ACTIVE"] != DBNull.Value && Convert.ToInt32(reader["IS_ACTIVE"]) == 1
                });
            }
            return locations;
        }

        public async Task<CameraLocation> GetLocationByIdAsync(string locationId)
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            var query = "SELECT LOCATION_ID, CAMERA_NAME, LOGIC_TYPE, LOCATION_TYPE, ASSOCIATED_ROOM_ID, IS_ACTIVE FROM CAMPUS_ADMIN.CAMERA_LOCATIONS WHERE LOCATION_ID = :id";
            using var cmd = new OracleCommand(query, connection);
            cmd.BindByName = true; // CRITICAL FIX
            cmd.Parameters.Add(new OracleParameter("id", locationId));
            
            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new CameraLocation
                {
                    Location_ID = reader["LOCATION_ID"].ToString(),
                    Camera_Name = reader["CAMERA_NAME"].ToString(),
                    Logic_Type = reader["LOGIC_TYPE"].ToString(),
                    Location_Type = reader["LOCATION_TYPE"].ToString(),
                    Associated_Room_ID = reader["ASSOCIATED_ROOM_ID"]?.ToString(),
                    Is_Active = reader["IS_ACTIVE"] != DBNull.Value && Convert.ToInt32(reader["IS_ACTIVE"]) == 1
                };
            }
            return null; // Not found
        }

        public async Task<bool> CreateLocationAsync(CameraLocation location)
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            // THE FIX: Removed STATUS_ON_SCAN since it does not exist in the Oracle table definition
            var query = @"INSERT INTO CAMPUS_ADMIN.CAMERA_LOCATIONS 
                          (LOCATION_ID, CAMERA_NAME, LOGIC_TYPE, LOCATION_TYPE, ASSOCIATED_ROOM_ID, IS_ACTIVE, CREATED_AT) 
                          VALUES (:id, :name, :logic, :type, :room, :active, SYSDATE)";
            
            using var cmd = new OracleCommand(query, connection);
            cmd.BindByName = true; // CRITICAL FIX
            
            cmd.Parameters.Add(new OracleParameter("id", location.Location_ID));
            cmd.Parameters.Add(new OracleParameter("name", location.Camera_Name));
            cmd.Parameters.Add(new OracleParameter("logic", location.Logic_Type));
            cmd.Parameters.Add(new OracleParameter("type", location.Location_Type));
            
            // Handles null room associations safely
            cmd.Parameters.Add(new OracleParameter("room", string.IsNullOrEmpty(location.Associated_Room_ID) ? DBNull.Value : location.Associated_Room_ID));
            cmd.Parameters.Add(new OracleParameter("active", location.Is_Active ? 1 : 0));

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

        public async Task<bool> UpdateLocationAsync(string locationId, CameraLocation location)
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            // THE FIX: Removed STATUS_ON_SCAN = 'System-Managed' from the UPDATE query
            var query = @"UPDATE CAMPUS_ADMIN.CAMERA_LOCATIONS 
                          SET CAMERA_NAME = :name, 
                              LOGIC_TYPE = :logic, 
                              LOCATION_TYPE = :type, 
                              ASSOCIATED_ROOM_ID = :room, 
                              IS_ACTIVE = :active 
                          WHERE LOCATION_ID = :id";

            using var cmd = new OracleCommand(query, connection);
            cmd.BindByName = true; // CRITICAL FIX
            
            cmd.Parameters.Add(new OracleParameter("name", location.Camera_Name));
            cmd.Parameters.Add(new OracleParameter("logic", location.Logic_Type));
            cmd.Parameters.Add(new OracleParameter("type", location.Location_Type));
            cmd.Parameters.Add(new OracleParameter("room", string.IsNullOrEmpty(location.Associated_Room_ID) ? DBNull.Value : location.Associated_Room_ID));
            cmd.Parameters.Add(new OracleParameter("active", location.Is_Active ? 1 : 0));
            cmd.Parameters.Add(new OracleParameter("id", locationId));

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

        public async Task<bool> DeleteLocationAsync(string locationId)
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = "DELETE FROM CAMPUS_ADMIN.CAMERA_LOCATIONS WHERE LOCATION_ID = :id";
            using var cmd = new OracleCommand(query, connection);
            cmd.BindByName = true; // CRITICAL FIX
            cmd.Parameters.Add(new OracleParameter("id", locationId));
            
            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }
    }
}
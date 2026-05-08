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
                ?? throw new InvalidOperationException("Oracle connection string is missing.");
        }

        public async Task<IEnumerable<CameraLocation>> GetAllActiveLocationsAsync()
        {
            var locations = new List<CameraLocation>();
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            // Note: Adjust the column names if your database uses slightly different casing
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

            // Auto-generate STATUS_ON_SCAN based on location type if not provided
            string statusOnScan = location.Status_On_Scan;
            if (string.IsNullOrEmpty(statusOnScan))
            {
                if (location.Logic_Type == "gate")
                {
                    statusOnScan = location.Location_Type == "entrance" ? "in-campus" : "offline";
                }
                else if (location.Logic_Type == "room")
                {
                    statusOnScan = "present-in-room";
                }
                else
                {
                    statusOnScan = "inactive";
                }
            }

            var query = @"INSERT INTO CAMPUS_ADMIN.CAMERA_LOCATIONS 
                          (LOCATION_ID, CAMERA_NAME, LOGIC_TYPE, LOCATION_TYPE, ASSOCIATED_ROOM_ID, STATUS_ON_SCAN, IS_ACTIVE, CREATED_AT) 
                          VALUES (:id, :name, :logic, :type, :room, :status, :active, SYSDATE)";
            
            using var cmd = new OracleCommand(query, connection);
            cmd.Parameters.Add(new OracleParameter("id", location.Location_ID));
            cmd.Parameters.Add(new OracleParameter("name", location.Camera_Name));
            cmd.Parameters.Add(new OracleParameter("logic", location.Logic_Type ?? "gate"));
            cmd.Parameters.Add(new OracleParameter("type", location.Location_Type));
            
            // Handles null room associations safely
            cmd.Parameters.Add(new OracleParameter("room", string.IsNullOrEmpty(location.Associated_Room_ID) ? DBNull.Value : location.Associated_Room_ID));
            cmd.Parameters.Add(new OracleParameter("status", statusOnScan));
            cmd.Parameters.Add(new OracleParameter("active", location.Is_Active ? 1 : 0));

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

        public async Task<bool> UpdateLocationAsync(string locationId, CameraLocation location)
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"UPDATE CAMPUS_ADMIN.CAMERA_LOCATIONS 
                          SET CAMERA_NAME = :name, LOGIC_TYPE = :logic, LOCATION_TYPE = :type, ASSOCIATED_ROOM_ID = :room, IS_ACTIVE = :active 
                          WHERE LOCATION_ID = :id";

            using var cmd = new OracleCommand(query, connection);
            cmd.Parameters.Add(new OracleParameter("name", location.Camera_Name));
            cmd.Parameters.Add(new OracleParameter("logic", location.Logic_Type));
            cmd.Parameters.Add(new OracleParameter("type", location.Location_Type));
            cmd.Parameters.Add(new OracleParameter("room", string.IsNullOrEmpty(location.Associated_Room_ID) ? DBNull.Value : location.Associated_Room_ID));
            cmd.Parameters.Add(new OracleParameter("active", location.Is_Active ? 1 : 0));
            
            // ID must be the last parameter to match the WHERE clause
            cmd.Parameters.Add(new OracleParameter("id", locationId));

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

        // 👇 The missing method that caused the build error! 👇
        public async Task<bool> DeleteLocationAsync(string locationId)
        {
            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = "DELETE FROM CAMPUS_ADMIN.CAMERA_LOCATIONS WHERE LOCATION_ID = :id";
            using var cmd = new OracleCommand(query, connection);
            cmd.Parameters.Add(new OracleParameter("id", locationId));
            
            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }
    }
}
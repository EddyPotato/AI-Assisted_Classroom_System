using System;
using System.Text.Json;
using System.Threading.Tasks;
using Oracle.ManagedDataAccess.Client;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging; 

namespace campus_backend.Services
{
    public partial class AccessVerificationService
    {
        public async Task ProcessPhase1BarcodeAsync(string payload)
        {
            _pendingStudentId = payload.Trim();
            if (payload.StartsWith("{"))
            {
                try
                {
                    using JsonDocument doc = JsonDocument.Parse(payload);
                    if (doc.RootElement.TryGetProperty("student_id", out var idProp)) _pendingStudentId = idProp.GetString()?.Trim() ?? "";
                    if (doc.RootElement.TryGetProperty("camera_location_id", out var locProp)) _currentLocationId = locProp.GetString()?.Trim() ?? "CAM-001";
                } catch { }
            }

            if (string.IsNullOrEmpty(_pendingStudentId)) return;
            _pendingFirstName = "Unknown"; _pendingLastName = "Identity"; _pendingFacePath = null;

            try
            {
                using var connection = new OracleConnection(_connectionString);
                await connection.OpenAsync();

                var query = "SELECT FIRST_NAME, MIDDLE_NAME, LAST_NAME, FACE_REFERENCE_PATH FROM CAMPUS_ADMIN.STUDENTS WHERE STUDENT_ID = :id";
                using var cmd = new OracleCommand(query, connection);
                cmd.Parameters.Add(new OracleParameter("id", _pendingStudentId));
                
                using var reader = await cmd.ExecuteReaderAsync();
                if (await reader.ReadAsync()) {
                    _pendingFirstName = reader["FIRST_NAME"]?.ToString() ?? "Unknown";
                    string mName = reader["MIDDLE_NAME"] != DBNull.Value ? reader["MIDDLE_NAME"]?.ToString() + " " : "";
                    _pendingLastName = mName + (reader["LAST_NAME"]?.ToString() ?? "");
                    _pendingFacePath = reader["FACE_REFERENCE_PATH"] != DBNull.Value ? reader["FACE_REFERENCE_PATH"]?.ToString() : null;
                }
                else {
                    var uCmd = new OracleCommand("SELECT FIRST_NAME, MIDDLE_NAME, LAST_NAME, FACE_REFERENCE_PATH FROM CAMPUS_ADMIN.USERS WHERE USER_ID = :id", connection);
                    uCmd.Parameters.Add(new OracleParameter("id", _pendingStudentId));
                    using var uReader = await uCmd.ExecuteReaderAsync();
                    if (await uReader.ReadAsync()) {
                        _pendingFirstName = uReader["FIRST_NAME"]?.ToString() ?? "Unknown";
                        string mName = uReader["MIDDLE_NAME"] != DBNull.Value ? uReader["MIDDLE_NAME"]?.ToString() + " " : "";
                        _pendingLastName = mName + (uReader["LAST_NAME"]?.ToString() ?? "");
                        _pendingFacePath = uReader["FACE_REFERENCE_PATH"] != DBNull.Value ? uReader["FACE_REFERENCE_PATH"]?.ToString() : null;
                    }
                }

                await _hubContext.Clients.All.SendAsync("ReceiveBarcode", new {
                    student_id = _pendingStudentId, first_name = _pendingFirstName, last_name = _pendingLastName,
                    face_reference_path = _pendingFacePath, status = _pendingFacePath != null ? "scanning" : "missing_face",
                    location_id = _currentLocationId
                });
            }
            catch (Exception ex) { _logger.LogError($"DB Error Phase 1: {ex.Message}"); }
        }
    }
}
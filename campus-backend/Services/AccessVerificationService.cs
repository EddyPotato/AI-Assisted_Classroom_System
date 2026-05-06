using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;
using System.Threading.Tasks;
using System;
using Oracle.ManagedDataAccess.Client;
using campus_backend.Hubs;
using campus_backend.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace campus_backend.Services
{
    public interface IAccessVerificationService
    {
        Task ProcessPhase1BarcodeAsync(string payload);
        Task ProcessPhase2VerificationAsync(string payload);
    }

    public class AccessVerificationService : IAccessVerificationService
    {
        private readonly ILogger<AccessVerificationService> _logger;
        private readonly IHubContext<CampusHub> _hubContext;
        private readonly string _connectionString;
        private readonly IServiceScopeFactory _scopeFactory;

        // State variables to hold data between Phase 1 and Phase 2
        private string _pendingStudentId = "";
        private string _pendingFirstName = "";
        private string _pendingLastName = "";
        private string _pendingFacePath = null;
        private string _currentLocationId = "CAM-001"; // Default fallback

        public AccessVerificationService(
            ILogger<AccessVerificationService> logger,
            IHubContext<CampusHub> hubContext,
            IConfiguration configuration,
            IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _hubContext = hubContext;
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _scopeFactory = scopeFactory;
        }

        // ==========================================
        // PHASE 1: Barcode Scanned
        // ==========================================
        public async Task ProcessPhase1BarcodeAsync(string payload)
        {
            _pendingStudentId = payload.Trim();
            
            // Extract Student ID and Location ID if sent as JSON from Python
            if (payload.StartsWith("{"))
            {
                try
                {
                    using JsonDocument doc = JsonDocument.Parse(payload);
                    if (doc.RootElement.TryGetProperty("student_id", out var idProp))
                        _pendingStudentId = idProp.GetString()?.Trim() ?? "";
                    
                    if (doc.RootElement.TryGetProperty("camera_location_id", out var locProp))
                        _currentLocationId = locProp.GetString()?.Trim() ?? "CAM-001";
                }
                catch { }
            }

            if (string.IsNullOrEmpty(_pendingStudentId)) return;

            _pendingFirstName = "Unknown";
            _pendingLastName = "Identity";
            _pendingFacePath = null;

            try
            {
                using var connection = new OracleConnection(_connectionString);
                await connection.OpenAsync();

                var query = @"SELECT FIRST_NAME, MIDDLE_NAME, LAST_NAME, FACE_REFERENCE_PATH 
                              FROM CAMPUS_ADMIN.STUDENTS WHERE STUDENT_ID = :id";

                using var cmd = new OracleCommand(query, connection);
                cmd.Parameters.Add(new OracleParameter("id", _pendingStudentId));
                
                using var reader = await cmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    _pendingFirstName = reader["FIRST_NAME"]?.ToString() ?? "Unknown";
                    string middleName = reader["MIDDLE_NAME"] != DBNull.Value ? reader["MIDDLE_NAME"]?.ToString() + " " : "";
                    _pendingLastName = middleName + (reader["LAST_NAME"]?.ToString() ?? "");
                    _pendingFacePath = reader["FACE_REFERENCE_PATH"] != DBNull.Value ? reader["FACE_REFERENCE_PATH"]?.ToString() : null;
                }

                await _hubContext.Clients.All.SendAsync("ReceiveBarcode", new
                {
                    student_id = _pendingStudentId,
                    first_name = _pendingFirstName,
                    last_name = _pendingLastName,
                    face_reference_path = _pendingFacePath,
                    status = _pendingFacePath != null ? "scanning" : "missing_face",
                    location_id = _currentLocationId
                });
            }
            catch (Exception ex) { _logger.LogError($"❌ DB Error Phase 1: {ex.Message}"); }
        }

        // ==========================================
        // PHASE 2: Face AI Verification Result
        // ==========================================
        public async Task ProcessPhase2VerificationAsync(string payload)
        {
            string status = "denied";
            if (payload.StartsWith("{"))
            {
                try
                {
                    using JsonDocument doc = JsonDocument.Parse(payload);
                    if (doc.RootElement.TryGetProperty("status", out var statusProp))
                        status = statusProp.GetString()?.ToLower() ?? "denied";
                }
                catch { }
            }

            try
            {
                using var connection = new OracleConnection(_connectionString);
                await connection.OpenAsync();

                // If approved, log the event into the database with the location!
                if (status == "approved" && !string.IsNullOrEmpty(_pendingStudentId))
                {
                    var logQuery = @"INSERT INTO CAMPUS_ADMIN.EVENT_LOGS (STUDENT_ID, STATUS, TIMESTAMP, LOCATION_ID) 
                                     VALUES (:id, 'Access Granted', SYSDATE, :loc)";
                    using var cmd = new OracleCommand(logQuery, connection);
                    cmd.Parameters.Add(new OracleParameter("id", _pendingStudentId));
                    cmd.Parameters.Add(new OracleParameter("loc", _currentLocationId));
                    await cmd.ExecuteNonQueryAsync();

                    _logger.LogInformation($"[SECURITY] Access Granted logged for {_pendingStudentId} at {_currentLocationId}");
                }

                // Resolve the camera name so the UI can display "Main Gate" instead of "CAM-001"
                string locationName = "Unknown Location";
                using (var scope = _scopeFactory.CreateScope())
                {
                    var repo = scope.ServiceProvider.GetRequiredService<ICameraLocationRepository>();
                    var locData = await repo.GetLocationByIdAsync(_currentLocationId);
                    if (locData != null) locationName = locData.Camera_Name;
                }

                // Broadcast final result to the React UI
                await _hubContext.Clients.All.SendAsync("ReceiveScanResult", new
                {
                    student_id = _pendingStudentId,
                    first_name = _pendingFirstName,
                    last_name = _pendingLastName,
                    status = status,
                    timestamp = DateTime.Now.ToString("HH:mm:ss"),
                    face_reference_path = _pendingFacePath,
                    location_id = _currentLocationId,
                    location_name = locationName
                });
            }
            catch (Exception ex) { _logger.LogError($"❌ DB Error Phase 2: {ex.Message}"); }
        }
    }
}
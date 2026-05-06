using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;
using System.Text;
using campus_backend.Models;
using campus_backend.Repositories;
using Microsoft.AspNetCore.SignalR;
using campus_backend.Hubs;
using System;
using Oracle.ManagedDataAccess.Client;
using Microsoft.Extensions.Configuration;

namespace campus_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CameraController : ControllerBase
    {
        private readonly ICameraLocationRepository _locationRepo;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IHubContext<CampusHub> _hubContext;
        private readonly string _connectionString;

        public CameraController(
            ICameraLocationRepository locationRepo, 
            IHttpClientFactory httpClientFactory,
            IHubContext<CampusHub> hubContext,
            IConfiguration configuration)
        {
            _locationRepo = locationRepo;
            _httpClientFactory = httpClientFactory;
            _hubContext = hubContext;
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? configuration.GetConnectionString("OracleConnection")
                ?? configuration.GetConnectionString("OracleDb")
                ?? throw new InvalidOperationException("Connection string not found.");
        }

        // --- LOCATION MANAGEMENT ENDPOINTS ---

        [HttpGet("locations")]
        public async Task<IActionResult> GetLocations()
        {
            var locations = await _locationRepo.GetAllActiveLocationsAsync();
            return Ok(locations);
        }

        [HttpPost("locations")]
        public async Task<IActionResult> CreateLocation([FromBody] CameraLocation location)
        {
            var success = await _locationRepo.CreateLocationAsync(location);
            if (success) return CreatedAtAction(nameof(GetLocations), new { id = location.Location_ID }, location);
            return BadRequest("Failed to create camera location.");
        }

        [HttpPut("location/{id}")]
        public async Task<IActionResult> UpdateLocation(string id, [FromBody] CameraLocation location)
        {
            var success = await _locationRepo.UpdateLocationAsync(id, location);
            if (success) return Ok();
            return NotFound("Camera location not found.");
        }

        // --- HARDWARE CONTROL ENDPOINTS (Proxies to Python Edge Node) ---

        [HttpPost("start")]
        public async Task<IActionResult> StartCamera([FromBody] CameraStateRequest request)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                
                // Forward the location ID to the Python edge node
                var payload = JsonSerializer.Serialize(new { location_id = request.Camera_Location_Id });
                var content = new StringContent(payload, Encoding.UTF8, "application/json");

                var response = await client.PostAsync("http://localhost:5000/start_camera", content);
                
                if (response.IsSuccessStatusCode) return Ok(new { message = "Hardware activated." });
                return StatusCode(502, "Edge node responded with an error.");
            }
            catch (Exception ex)
            {
                return StatusCode(503, $"Cannot reach edge node: {ex.Message}");
            }
        }

        [HttpPost("stop")]
        public async Task<IActionResult> StopCamera([FromBody] CameraStateRequest request)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                var response = await client.PostAsync("http://localhost:5000/stop_camera", null);
                if (response.IsSuccessStatusCode) return Ok(new { message = "Hardware deactivated." });
                return StatusCode(502, "Edge node responded with an error.");
            }
            catch (Exception ex)
            {
                return StatusCode(503, $"Cannot reach edge node: {ex.Message}");
            }
        }

        // --- MANUAL SCAN / BYPASS ENDPOINT ---

        [HttpPost("manual-scan")]
        public async Task<IActionResult> ManualScan([FromBody] ManualScanRequest request)
        {
            if (string.IsNullOrEmpty(request.Student_Id)) return BadRequest("Student ID is required.");

            string firstName = "Unknown";
            string lastName = "Identity";
            string facePath = null;

            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            var query = "SELECT FIRST_NAME, MIDDLE_NAME, LAST_NAME, FACE_REFERENCE_PATH FROM CAMPUS_ADMIN.STUDENTS WHERE STUDENT_ID = :id";
            using var cmd = new OracleCommand(query, connection);
            cmd.Parameters.Add(new OracleParameter("id", request.Student_Id));
            
            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                firstName = reader["FIRST_NAME"]?.ToString() ?? "Unknown";
                string middleName = reader["MIDDLE_NAME"] != DBNull.Value ? reader["MIDDLE_NAME"]?.ToString() + " " : "";
                lastName = middleName + (reader["LAST_NAME"]?.ToString() ?? "");
                facePath = reader["FACE_REFERENCE_PATH"] != DBNull.Value ? reader["FACE_REFERENCE_PATH"]?.ToString() : null;
            }
            else
            {
                return NotFound("Student ID not found in database.");
            }

            // If it's a bypass, log it immediately without waiting for face scan
            if (!string.IsNullOrEmpty(request.Bypass_Reason))
            {
                // NORMALIZED STATUS: 'approved' instead of 'Access Granted'
                var logQuery = @"INSERT INTO CAMPUS_ADMIN.EVENT_LOGS (STUDENT_ID, STATUS, TIMESTAMP, LOCATION_ID, BYPASS_REASON)
                                  VALUES (:id, 'approved', SYSDATE, :loc, :reason)";
                using var logCmd = new OracleCommand(logQuery, connection);
                logCmd.Parameters.Add(new OracleParameter("id", request.Student_Id));
                logCmd.Parameters.Add(new OracleParameter("loc", request.Camera_Location_Id ?? "CAM-001"));
                logCmd.Parameters.Add(new OracleParameter("reason", request.Bypass_Reason));
                
                await logCmd.ExecuteNonQueryAsync();

                // Broadcast the bypass to the UI
                await _hubContext.Clients.All.SendAsync("ReceiveScanResult", new
                {
                    student_id = request.Student_Id,
                    first_name = firstName,
                    last_name = lastName,
                    status = "approved",
                    bypass_reason = request.Bypass_Reason,
                    timestamp = DateTime.Now.ToString("HH:mm:ss"),
                    face_reference_path = facePath
                });

                return Ok(new { message = "Manual bypass logged successfully." });
            }

            // If it's just a manual ID entry (no barcode), trigger Phase 1 in the UI
            await _hubContext.Clients.All.SendAsync("ReceiveBarcode", new
            {
                student_id = request.Student_Id,
                first_name = firstName,
                last_name = lastName,
                face_reference_path = facePath,
                status = facePath != null ? "scanning" : "missing_face"
            });

            return Ok(new { message = "Manual scan initiated. Awaiting face verification." });
        }
    }
}
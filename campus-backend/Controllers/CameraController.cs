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
        public class CameraStartRequest
        {
            public string? Camera_Location_Id { get; set; }
            public int Hardware_Index { get; set; } = 0;
        }

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

        [HttpPost("start")]
        public async Task<IActionResult> StartCamera([FromBody] CameraStartRequest request)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                var payload = JsonSerializer.Serialize(new { location_id = request.Camera_Location_Id, hardware_index = request.Hardware_Index });
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

        // --- MANUAL SCAN & BYPASS LOGIC ---
        [HttpPost("manual-scan")]
        public async Task<IActionResult> ManualScan([FromBody] ManualScanRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Student_Id)) return BadRequest("Student ID is required.");

            string studentId = request.Student_Id.Trim();
            string firstName = "Unknown";
            string lastName = "Identity";
            string facePath = null;

            using var connection = new OracleConnection(_connectionString);
            await connection.OpenAsync();

            var query = "SELECT FIRST_NAME, MIDDLE_NAME, LAST_NAME, FACE_REFERENCE_PATH FROM CAMPUS_ADMIN.STUDENTS WHERE STUDENT_ID = :id";
            using var cmd = new OracleCommand(query, connection);
            
            // THE FIX: Oracle requires this flag to map variables correctly when using named parameters!
            cmd.BindByName = true; 
            cmd.Parameters.Add(new OracleParameter("id", studentId));
            
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
                // Check USERS table for staff/professors if not found in STUDENTS
                var staffQuery = "SELECT FIRST_NAME, MIDDLE_NAME, LAST_NAME, FACE_REFERENCE_PATH FROM CAMPUS_ADMIN.USERS WHERE USER_ID = :id";
                using var staffCmd = new OracleCommand(staffQuery, connection);
                staffCmd.BindByName = true;
                staffCmd.Parameters.Add(new OracleParameter("id", studentId));
                
                using var staffReader = await staffCmd.ExecuteReaderAsync();
                if (await staffReader.ReadAsync())
                {
                    firstName = staffReader["FIRST_NAME"]?.ToString() ?? "Unknown";
                    string middleName = staffReader["MIDDLE_NAME"] != DBNull.Value ? staffReader["MIDDLE_NAME"]?.ToString() + " " : "";
                    lastName = middleName + (staffReader["LAST_NAME"]?.ToString() ?? "");
                    facePath = staffReader["FACE_REFERENCE_PATH"] != DBNull.Value ? staffReader["FACE_REFERENCE_PATH"]?.ToString() : null;
                }
                else
                {
                    return NotFound(new { message = "ID not found in database." });
                }
            }

            // A. If it's a bypass, log it immediately and approve it without Face Scan
            if (!string.IsNullOrWhiteSpace(request.Bypass_Reason))
            {
                var logQuery = @"INSERT INTO CAMPUS_ADMIN.EVENT_LOGS (STUDENT_ID, STATUS, TIMESTAMP, LOCATION_ID, BYPASS_REASON)
                                  VALUES (:id, 'approved', SYSDATE, :loc, :reason)";
                using var logCmd = new OracleCommand(logQuery, connection);
                logCmd.BindByName = true;
                logCmd.Parameters.Add(new OracleParameter("id", studentId));
                logCmd.Parameters.Add(new OracleParameter("loc", request.Camera_Location_Id ?? "CAM-001"));
                logCmd.Parameters.Add(new OracleParameter("reason", request.Bypass_Reason));
                
                await logCmd.ExecuteNonQueryAsync();

                await _hubContext.Clients.All.SendAsync("ReceiveScanResult", new
                {
                    student_id = studentId,
                    first_name = firstName,
                    last_name = lastName,
                    status = "approved",
                    bypass_reason = request.Bypass_Reason,
                    timestamp = DateTime.Now.ToString("HH:mm:ss"),
                    face_reference_path = facePath
                });

                return Ok(new { message = "Manual bypass logged successfully." });
            }

            // B. If it's just a manual ID entry, trigger Face Recognition sequence
            await _hubContext.Clients.All.SendAsync("ReceiveBarcode", new
            {
                student_id = studentId,
                first_name = firstName,
                last_name = lastName,
                face_reference_path = facePath,
                status = facePath != null ? "scanning" : "missing_face"
            });

            // Tell Python to start compiling the 128D map for verification
            try
            {
                var client = _httpClientFactory.CreateClient();
                var payload = JsonSerializer.Serialize(new { student_id = studentId });
                var content = new StringContent(payload, Encoding.UTF8, "application/json");
                await client.PostAsync("http://localhost:5000/manual_scan", content);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to notify edge node: {ex.Message}");
            }

            return Ok(new { message = "Manual scan initiated. Awaiting face verification." });
        }
    }
}
using System;
using System.Text.Json;
using System.Threading.Tasks;
using System.Net.Http; 
using System.Text;     
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using campus_backend.Hubs;
using campus_backend.Repositories;

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
        private readonly IServiceScopeFactory _scopeFactory;

        // Shared State across phases
        private string _pendingStudentId = "";
        private string _pendingFirstName = "";
        private string _pendingMiddleName = ""; 
        private string _pendingLastName = "";
        private string? _pendingFacePath = null;
        private string _currentLocationId = "CAM-001";
        private string _pendingRole = "student"; 
        
        // State flag to completely lock out Phase 2 if Phase 1 resolves early.
        private bool _abortPhase2 = false; 

        public AccessVerificationService(
            ILogger<AccessVerificationService> logger,
            IHubContext<CampusHub> hubContext,
            IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _hubContext = hubContext;
            _scopeFactory = scopeFactory; 
        }

        public async Task ProcessPhase1BarcodeAsync(string payload)
        {
            _abortPhase2 = false; // Reset the lock on every new barcode scan
            ParsePayload(payload);
            if (string.IsNullOrEmpty(_pendingStudentId)) return;

            string earlyStatus = "missing_face";
            string scanHint = "";
            string logicType = "gate";
            string locationType = "entrance";
            string? associatedRoomId = null;

            using (var scope = _scopeFactory.CreateScope())
            {
                var studentRepo = scope.ServiceProvider.GetRequiredService<IStudentRepository>();
                var userRepo = scope.ServiceProvider.GetRequiredService<IUserRepository>();
                var locRepo = scope.ServiceProvider.GetRequiredService<ICameraLocationRepository>();
                var schedRepo = scope.ServiceProvider.GetRequiredService<IScheduleRepository>();
                var attRepo = scope.ServiceProvider.GetRequiredService<IAttendanceRepository>();

                // 1. Fetch Node Data
                var locData = await locRepo.GetLocationByIdAsync(_currentLocationId);
                if (locData != null) {
                    logicType = locData.Logic_Type?.ToLower() ?? "gate";
                    locationType = locData.Location_Type?.ToLower() ?? "entrance";
                    associatedRoomId = locData.Associated_Room_ID;
                }

                // 2. Fetch Identity Data
                var student = await studentRepo.GetStudentByIdAsync(_pendingStudentId);
                if (student != null) {
                    _pendingFirstName = student.First_Name ?? "Unknown";
                    _pendingMiddleName = student.Middle_Name ?? ""; 
                    _pendingLastName = student.Last_Name ?? "";
                    
                    // KEEP THE PHOTO INTACT
                    _pendingFacePath = student.Face_Reference_Path; 
                    _pendingRole = "student";
                } else {
                    var user = await userRepo.GetUserByIdAsync(_pendingStudentId);
                    if (user != null) {
                        _pendingFirstName = user.First_Name ?? "Unknown";
                        _pendingMiddleName = user.Middle_Name ?? ""; 
                        _pendingLastName = user.Last_Name ?? "";
                        
                        // KEEP THE PHOTO INTACT
                        _pendingFacePath = user.Face_Reference_Path; 
                        _pendingRole = "user";
                    }
                }
                
                earlyStatus = !string.IsNullOrEmpty(_pendingFacePath) ? "scanning" : "missing_face";

                // 3. EARLY EVALUATION (Stop Phase 2 before it even starts)
                string currentPresence = await attRepo.GetCurrentPresenceAsync(_pendingStudentId, _pendingRole);

                if (earlyStatus == "scanning")
                {
                    if (logicType == "gate" && locationType == "entrance")
                    {
                        // Immediate Duplicate Check for Campus Entry
                        if (currentPresence.ToLower() == "in-campus")
                        {
                            earlyStatus = "duplicate";
                            scanHint = "Campus Access Active: You are already IN-CAMPUS.";
                            _abortPhase2 = true; // Lock out Phase 2 completely
                        }
                    }
                    // THE FIX: Added reverse logic check for the EXIT gate here!
                    else if (logicType == "gate" && locationType == "exit") 
                    {
                        // Immediate Duplicate Check for Campus Exit
                        if (currentPresence.ToLower() == "offline" || string.IsNullOrEmpty(currentPresence))
                        {
                            earlyStatus = "duplicate"; // Reusing duplicate status for UI styling
                            scanHint = "Campus Access Inactive: You are already OUTSIDE.";
                            _abortPhase2 = true; // Lock out Phase 2 completely
                        }
                    }
                    else if (logicType == "room" && locationType == "entrance")
                    {
                        // Immediate Schedule Check
                        if (_pendingRole == "student") 
                        {
                            bool isEnrolled = await schedRepo.IsStudentInClassNowAsync(_pendingStudentId, associatedRoomId ?? "");
                            if (!isEnrolled) {
                                earlyStatus = "invalid_schedule";
                                scanHint = "No scheduled class here at this time.";
                                _abortPhase2 = true; // Lock out Phase 2 completely
                            }
                        }
                    }
                }
            }

            // Blast Phase 1 Result to UI
            await _hubContext.Clients.All.SendAsync("ReceiveBarcode", new {
                student_id = _pendingStudentId, 
                first_name = _pendingFirstName, 
                middle_name = _pendingMiddleName,
                last_name = _pendingLastName,
                face_reference_path = _pendingFacePath, 
                status = earlyStatus,
                message = scanHint, 
                hint = scanHint,
                location_id = _currentLocationId
            });

            // Notify edge node to cancel facial recognition if aborted
            if (_abortPhase2)
            {
                try
                {
                    using var httpClient = new HttpClient();
                    var content = new StringContent("{\"command\":\"abort_phase2\"}", Encoding.UTF8, "application/json");
                    // Call the Python edge node directly
                    await httpClient.PostAsync("http://localhost:5000/command", content);
                    _logger.LogInformation("[SYSTEM] Sent abort_phase2 command to edge node.");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning($"[SYSTEM] Failed to abort edge node Phase 2: {ex.Message}");
                }
            }
        }

        public async Task ProcessPhase2VerificationAsync(string payload)
        {
            // Completely block Phase 2 if Phase 1 resolved it (duplicate/invalid schedule).
            if (_abortPhase2) return; 

            string status = "denied";
            ParsePayload(payload, out status);

            string locationName = "Unknown Location", scanHint = "";

            if (status == "approved" && !string.IsNullOrEmpty(_pendingStudentId))
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var locRepo = scope.ServiceProvider.GetRequiredService<ICameraLocationRepository>();
                    var attRepo = scope.ServiceProvider.GetRequiredService<IAttendanceRepository>();
                    var schedRepo = scope.ServiceProvider.GetRequiredService<IScheduleRepository>();

                    var locData = await locRepo.GetLocationByIdAsync(_currentLocationId);
                    if (locData != null) locationName = locData.Camera_Name;

                    string currentPresence = await attRepo.GetCurrentPresenceAsync(_pendingStudentId, _pendingRole);
                    string newPresence = currentPresence;
                    string eventLogStatus = "approved";

                    // Apply Final State Machine Rules
                    if (locData?.Logic_Type?.ToLower() == "gate")
                    {
                        if (locData.Location_Type?.ToLower() == "entrance") 
                        {
                            newPresence = "in-campus";
                            scanHint = "ENTRY RECORDED. WELCOME TO CAMPUS!"; 
                        }
                        else 
                        {
                            if (currentPresence.ToLower() == "in-class") { 
                                eventLogStatus = "Cutting / Early Exit"; 
                                status = "cutting"; 
                                scanHint = "WARNING: You have an ongoing class. Exit recorded as CUTTING.";
                            } 
                            else {
                                newPresence = "offline";
                                scanHint = "EXIT RECORDED. THANK YOU!"; // Guarantee Exit Message
                            }
                        }
                    }
                    else if (locData?.Logic_Type?.ToLower() == "room")
                    {
                        if (_pendingRole == "user") {
                            newPresence = "in-class";
                            scanHint = "PROFESSOR ATTENDANCE RECORDED.";
                        }
                        else {
                            bool isEnrolled = await schedRepo.IsStudentInClassNowAsync(_pendingStudentId, locData.Associated_Room_ID ?? "");
                            if (isEnrolled) {
                                newPresence = "in-class";
                                scanHint = "CLASS ATTENDANCE RECORDED.";
                            }
                            else { 
                                status = "denied"; 
                                eventLogStatus = "Invalid Schedule / Wrong Room"; 
                                scanHint = "No scheduled class here."; 
                            }
                        }
                    }

                    // Log it safely through the Repository
                    if(status == "approved" || status == "cutting") {
                        await attRepo.UpdatePresenceAndLogAsync(_pendingStudentId, _pendingRole, _currentLocationId, newPresence, eventLogStatus);
                    }
                }
            }
            else if (status == "denied")
            {
                scanHint = "FACE MATCH FAILED. ACCESS DENIED.";
            }

            // Blast Phase 2 Result to UI
            await _hubContext.Clients.All.SendAsync("ReceiveScanResult", new {
                student_id = _pendingStudentId, 
                first_name = _pendingFirstName, 
                middle_name = _pendingMiddleName, 
                last_name = _pendingLastName,
                status = status, 
                message = scanHint, 
                hint = scanHint, 
                timestamp = DateTime.Now.ToString("hh:mm tt"),
                face_reference_path = _pendingFacePath, 
                location_id = _currentLocationId, 
                location_name = locationName
            });
        }

        private void ParsePayload(string payload, out string status)
        {
            status = "denied";
            if (!payload.StartsWith("{")) { _pendingStudentId = payload.Trim(); return; }
            try {
                using JsonDocument doc = JsonDocument.Parse(payload);
                if (doc.RootElement.TryGetProperty("student_id", out var idProp)) _pendingStudentId = idProp.GetString()?.Trim() ?? "";
                if (doc.RootElement.TryGetProperty("camera_location_id", out var locProp)) _currentLocationId = locProp.GetString()?.Trim() ?? "CAM-001";
                if (doc.RootElement.TryGetProperty("status", out var statusProp)) status = statusProp.GetString()?.ToLower() ?? "denied";
            } catch { }
        }
        
        private void ParsePayload(string payload) => ParsePayload(payload, out _);
    }
}
using System;
using System.Text.Json;
using System.Threading.Tasks;
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
        private string _pendingLastName = "";
        private string? _pendingFacePath = null;
        private string _currentLocationId = "CAM-001";
        private string _pendingRole = "student"; 

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
                    _pendingLastName = student.Last_Name ?? "";
                    // _pendingFacePath = student.Face_Reference_Path; 
                    _pendingRole = "student";
                } else {
                    var user = await userRepo.GetUserByIdAsync(_pendingStudentId);
                    if (user != null) {
                        _pendingFirstName = user.First_Name ?? "Unknown";
                        _pendingLastName = user.Last_Name ?? "";
                        _pendingRole = "user";
                    }
                }
                
                earlyStatus = _pendingFacePath != null ? "scanning" : "missing_face";

                // 3. Early Rejection Check (Rooms)
                if (earlyStatus == "scanning" && logicType == "room" && locationType == "entrance")
                {
                    if (_pendingRole == "student") 
                    {
                        bool isEnrolled = await schedRepo.IsStudentInClassNowAsync(_pendingStudentId, associatedRoomId ?? "");
                        if (!isEnrolled) {
                            earlyStatus = "invalid_schedule";
                            scanHint = "No scheduled class here.";
                            _pendingFirstName = ""; _pendingLastName = ""; _pendingFacePath = null;
                        }
                    }
                }
            }

            await _hubContext.Clients.All.SendAsync("ReceiveBarcode", new {
                student_id = _pendingStudentId, 
                first_name = _pendingFirstName, 
                last_name = _pendingLastName,
                face_reference_path = _pendingFacePath, 
                status = earlyStatus,
                hint = scanHint,
                location_id = _currentLocationId
            });
        }

        public async Task ProcessPhase2VerificationAsync(string payload)
        {
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

                    // Apply State Machine Rules
                    if (locData?.Logic_Type?.ToLower() == "gate")
                    {
                        if (locData.Location_Type?.ToLower() == "entrance") newPresence = "in-campus";
                        else {
                            if (currentPresence == "in-class") { eventLogStatus = "Cutting / Early Exit"; status = "cutting"; }
                            newPresence = "offline";
                        }
                    }
                    else if (locData?.Logic_Type?.ToLower() == "room")
                    {
                        if (_pendingRole == "user") newPresence = "in-class";
                        else {
                            bool isEnrolled = await schedRepo.IsStudentInClassNowAsync(_pendingStudentId, locData.Associated_Room_ID ?? "");
                            if (isEnrolled) newPresence = "in-class";
                            else { status = "denied"; eventLogStatus = "Invalid Schedule / Wrong Room"; scanHint = "No scheduled class here."; }
                        }
                    }

                    // Log it safely through the Repository
                    await attRepo.UpdatePresenceAndLogAsync(_pendingStudentId, _pendingRole, _currentLocationId, newPresence, eventLogStatus);
                }
            }

            await _hubContext.Clients.All.SendAsync("ReceiveScanResult", new {
                student_id = _pendingStudentId, first_name = _pendingFirstName, last_name = _pendingLastName,
                status = status, hint = scanHint, timestamp = DateTime.Now.ToString("HH:mm:ss"),
                face_reference_path = _pendingFacePath, location_id = _currentLocationId, location_name = locationName
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
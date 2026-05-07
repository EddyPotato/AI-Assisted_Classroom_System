using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.SignalR;
using Oracle.ManagedDataAccess.Client;
using Microsoft.Extensions.Logging; 
using campus_backend.Repositories;

namespace campus_backend.Services
{
    public partial class AccessVerificationService
    {
        public async Task ProcessPhase2VerificationAsync(string payload)
        {
            string status = "denied";
            if (payload.StartsWith("{")) {
                try {
                    using JsonDocument doc = JsonDocument.Parse(payload);
                    if (doc.RootElement.TryGetProperty("status", out var statusProp)) status = statusProp.GetString()?.ToLower() ?? "denied";
                    if (doc.RootElement.TryGetProperty("camera_location_id", out var locProp)) _currentLocationId = locProp.GetString()?.Trim() ?? _currentLocationId;
                } catch { }
            }

            try {
                using var connection = new OracleConnection(_connectionString);
                await connection.OpenAsync();

                string locationName = "Unknown Location", logicType = "gate", locationType = "entrance";
                string? associatedRoomId = null; string scanHint = "";

                using (var scope = _scopeFactory.CreateScope()) {
                    var repo = scope.ServiceProvider.GetRequiredService<ICameraLocationRepository>();
                    var locData = await repo.GetLocationByIdAsync(_currentLocationId);
                    if (locData != null) {
                        locationName = locData.Camera_Name; logicType = locData.Logic_Type?.ToLower() ?? "gate";
                        locationType = locData.Location_Type?.ToLower() ?? "entrance"; associatedRoomId = locData.Associated_Room_ID;
                    }
                }

                if (status == "approved" && !string.IsNullOrEmpty(_pendingStudentId)) {
                    
                    var dbResult = await GetCurrentPresenceAsync(connection);
                    string newPresence = dbResult.presence;
                    string eventLogStatus = "approved";

                    if (logicType == "gate") {
                        var gateResult = EvaluateGateLogic(locationType, dbResult.presence, status);
                        newPresence = gateResult.newPres;
                        eventLogStatus = gateResult.logStat;
                        status = gateResult.finalStat;
                    }
                    else if (logicType == "room") {
                        var roomResult = await EvaluateRoomLogicAsync(connection, dbResult.table, dbResult.presence, associatedRoomId, status);
                        newPresence = roomResult.newPres;
                        eventLogStatus = roomResult.logStat;
                        scanHint = roomResult.hint;
                        status = roomResult.finalStat;
                    }

                    await UpdatePresenceAndLogAsync(connection, dbResult.table, dbResult.idCol, newPresence, eventLogStatus);
                }

                await _hubContext.Clients.All.SendAsync("ReceiveScanResult", new {
                    student_id = _pendingStudentId, first_name = _pendingFirstName, last_name = _pendingLastName,
                    status = status, hint = scanHint, timestamp = DateTime.Now.ToString("HH:mm:ss"),
                    face_reference_path = _pendingFacePath, location_id = _currentLocationId, location_name = locationName
                });
            }
            catch (Exception ex) { _logger.LogError($"DB Error Phase 2: {ex.Message}"); }
        }
    }
}
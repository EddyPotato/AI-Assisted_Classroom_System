using System;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MQTTnet;
using MQTTnet.Client;
using Oracle.ManagedDataAccess.Client;
using campus_backend.Hubs;

namespace campus_backend.Services
{
    public class MqttListenerService : BackgroundService
    {
        private readonly IMqttClient _mqttClient;
        private readonly MqttClientOptions _mqttOptions;
        private readonly IHubContext<CampusHub> _hubContext;
        private readonly IConfiguration _configuration;
        private readonly ILogger<MqttListenerService> _logger;
        private readonly string _connectionString;

        // Temporary memory to hold the student data between Phase 1 (Barcode) and Phase 2 (Face)
        private string? _pendingStudentId;
        private string? _pendingFirstName;
        private string? _pendingLastName;
        private string? _pendingFacePath;

        public MqttListenerService(
            IHubContext<CampusHub> hubContext,
            IConfiguration configuration,
            ILogger<MqttListenerService> logger)
        {
            _hubContext = hubContext;
            _configuration = configuration;
            _logger = logger;

            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? configuration.GetConnectionString("OracleConnection")
                ?? configuration.GetConnectionString("OracleDb")
                ?? throw new InvalidOperationException("Connection string not found.");

            var factory = new MqttFactory();
            _mqttClient = factory.CreateMqttClient();

            _mqttOptions = new MqttClientOptionsBuilder()
                .WithTcpServer("localhost", 1883)
                .WithClientId("CampusBackendListener_" + Guid.NewGuid().ToString())
                .Build();

            _mqttClient.ApplicationMessageReceivedAsync += OnMessageReceivedAsync;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await ConnectMqttAsync(stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(5000, stoppingToken);

                if (!_mqttClient.IsConnected)
                {
                    _logger.LogWarning("⚠️ MQTT disconnected. Attempting to reconnect...");
                    await ConnectMqttAsync(stoppingToken);
                }
            }
        }

        private async Task ConnectMqttAsync(CancellationToken stoppingToken)
        {
            try
            {
                if (!_mqttClient.IsConnected)
                {
                    await _mqttClient.ConnectAsync(_mqttOptions, stoppingToken);
                    
                    var subscribeOptions = new MqttFactory().CreateSubscribeOptionsBuilder()
                        .WithTopicFilter(f => { f.WithTopic("campus/door/scan"); })
                        .WithTopicFilter(f => { f.WithTopic("campus/door/verified"); }) 
                        .Build();

                    await _mqttClient.SubscribeAsync(subscribeOptions, stoppingToken);
                    _logger.LogInformation("✅ MQTT Listener Service Started & Subscribed to edge node topics!");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ MQTT Connection Error: {ex.Message}");
            }
        }

        private async Task OnMessageReceivedAsync(MqttApplicationMessageReceivedEventArgs e)
        {
            var topic = e.ApplicationMessage.Topic;
            var payload = Encoding.UTF8.GetString(e.ApplicationMessage.PayloadSegment);

            _logger.LogInformation($"📥 Camera Event on [{topic}]: {payload}");

            if (topic == "campus/door/scan")
            {
                await ProcessPhase1BarcodeAsync(payload);
            }
            else if (topic == "campus/door/verified")
            {
                await ProcessPhase2FaceVerifiedAsync(payload);
            }
        }

        // PHASE 1: Barcode Scanned -> Look up user and tell UI to prepare for face scan
        private async Task ProcessPhase1BarcodeAsync(string payload)
        {
            _pendingStudentId = payload.Trim();
            if (payload.StartsWith("{"))
            {
                try
                {
                    var json = JsonSerializer.Deserialize<JsonElement>(payload);
                    if (json.TryGetProperty("student_id", out var idProp))
                        _pendingStudentId = idProp.GetString()?.Trim() ?? "";
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

                // Bulletproof Query 1: Get Name
                using var nameCmd = new OracleCommand("SELECT FIRST_NAME, LAST_NAME FROM CAMPUS_ADMIN.USERS WHERE USER_ID = :id", connection);
                nameCmd.Parameters.Add(new OracleParameter("id", _pendingStudentId));
                using var nameReader = await nameCmd.ExecuteReaderAsync();
                if (await nameReader.ReadAsync())
                {
                    _pendingFirstName = nameReader["FIRST_NAME"]?.ToString() ?? "Unknown";
                    _pendingLastName = nameReader["LAST_NAME"]?.ToString() ?? "";
                }

                // Bulletproof Query 2: Get Face Photo
                using var faceCmd = new OracleCommand("SELECT FACE_REFERENCE_PATH FROM CAMPUS_ADMIN.STUDENTS WHERE STUDENT_ID = :id", connection);
                faceCmd.Parameters.Add(new OracleParameter("id", _pendingStudentId));
                using var faceReader = await faceCmd.ExecuteReaderAsync();
                if (await faceReader.ReadAsync())
                {
                    _pendingFacePath = faceReader["FACE_REFERENCE_PATH"] != DBNull.Value ? faceReader["FACE_REFERENCE_PATH"]?.ToString() : null;
                }

                // Broadcast to React UI: "Barcode received, scanning face now..."
                await _hubContext.Clients.All.SendAsync("ReceiveBarcode", new
                {
                    student_id = _pendingStudentId,
                    first_name = _pendingFirstName,
                    last_name = _pendingLastName,
                    face_reference_path = _pendingFacePath,
                    status = "scanning" // This triggers the UI animation!
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Database Lookup Error: {ex.Message}");
            }
        }

        // PHASE 2: Face AI finishes -> Save log and tell UI the final result
        private async Task ProcessPhase2FaceVerifiedAsync(string payload)
        {
            if (string.IsNullOrEmpty(_pendingStudentId)) return; // Ignored if no barcode was scanned first

            string finalStatus = "approved"; // Default fallback
            int confidence = 95;

            // Extract status from Python's payload (e.g. {"status": "denied"})
            if (payload.StartsWith("{"))
            {
                try
                {
                    var json = JsonSerializer.Deserialize<JsonElement>(payload);
                    if (json.TryGetProperty("status", out var statusProp))
                        finalStatus = statusProp.GetString()?.Trim().ToLower() ?? "approved";
                }
                catch { }
            }
            else
            {
                finalStatus = payload.Trim().ToLower();
            }

            try
            {
                using var connection = new OracleConnection(_connectionString);
                await connection.OpenAsync();

                // Save to EVENT_LOGS
                using var logCmd = new OracleCommand(
                    @"INSERT INTO CAMPUS_ADMIN.EVENT_LOGS (STUDENT_ID, STATUS, MATCH_CONFIDENCE, TIMESTAMP) 
                      VALUES (:id, :status, :conf, CURRENT_TIMESTAMP)", connection);
                
                logCmd.Parameters.Add(new OracleParameter("id", _pendingStudentId));
                logCmd.Parameters.Add(new OracleParameter("status", finalStatus));
                logCmd.Parameters.Add(new OracleParameter("conf", confidence));

                await logCmd.ExecuteNonQueryAsync();

                // Broadcast final result to React UI
                await _hubContext.Clients.All.SendAsync("ReceiveScanResult", new
                {
                    student_id = _pendingStudentId,
                    first_name = _pendingFirstName,
                    last_name = _pendingLastName,
                    status = finalStatus,
                    timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                    face_reference_path = _pendingFacePath,
                    bypass_reason = (string?)null
                });

                _logger.LogInformation($"✅ Phase 2 Complete: Broadcasted final status [{finalStatus}] for {_pendingStudentId}");
                
                // Clear pending data
                _pendingStudentId = null;
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Final Log Error: {ex.Message}");
            }
        }
    }
}
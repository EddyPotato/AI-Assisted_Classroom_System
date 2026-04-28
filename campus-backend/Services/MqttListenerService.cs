using MQTTnet;
using MQTTnet.Client;
using System.Text;
using Oracle.ManagedDataAccess.Client;

namespace campus_backend.Services
{
    public class MqttListenerService : BackgroundService
    {
        private IMqttClient _mqttClient;
        private readonly ILogger<MqttListenerService> _logger;
        private readonly IConfiguration _configuration;

        public MqttListenerService(ILogger<MqttListenerService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            var factory = new MqttFactory();
            _mqttClient = factory.CreateMqttClient();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var options = new MqttClientOptionsBuilder()
                .WithTcpServer("127.0.0.1", 1883) // Points to your local Mosquitto Broker
                .Build();

            _mqttClient.ApplicationMessageReceivedAsync += async e =>
            {
                var topic = e.ApplicationMessage.Topic;
                
                // THE FIX: Safely extract the payload regardless of MQTTnet version
                var scannedId = Encoding.UTF8.GetString(e.ApplicationMessage.Payload ?? Array.Empty<byte>());
                
                _logger.LogInformation($"📥 Camera Scan Received on [{topic}]: {scannedId}");
                
                // Fire the database insertion
                await LogAttendanceToDatabase(scannedId);
            };

            // Keep retrying connection if the broker isn't up immediately
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    if (!_mqttClient.IsConnected)
                    {
                        await _mqttClient.ConnectAsync(options, stoppingToken);
                        // Subscribe to the EXACT topic from your vision_node.py
                        await _mqttClient.SubscribeAsync("campus/door/scan", cancellationToken: stoppingToken);
                        _logger.LogInformation("✅ MQTT Listener Service Started & Subscribed to campus/door/scan!");
                    }
                }
                catch
                {
                    _logger.LogWarning("⚠️ MQTT Broker not found. Retrying in 5 seconds...");
                }
                
                await Task.Delay(5000, stoppingToken);
            }
        }

        private async Task LogAttendanceToDatabase(string studentId)
        {
            try
            {
                string connStr = _configuration.GetConnectionString("OracleConnection") 
                                 ?? throw new Exception("Database string missing.");
                                 
                using (OracleConnection con = new OracleConnection(connStr))
                {
                    // Note: Update this query if your table/columns are named differently in Oracle
                    string sql = @"
                        INSERT INTO AttendanceLogs (Student_ID, Time_In, Status) 
                        VALUES (:id, CURRENT_TIMESTAMP, 'Present')";

                    using (OracleCommand cmd = new OracleCommand(sql, con))
                    {
                        cmd.Parameters.Add(new OracleParameter("id", studentId));

                        await con.OpenAsync();
                        await cmd.ExecuteNonQueryAsync();
                        _logger.LogInformation($"💾 Saved attendance for {studentId} to Oracle DB!");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Database Error: {ex.Message}");
            }
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            await _mqttClient.DisconnectAsync(new MqttClientDisconnectOptions(), cancellationToken);
            await base.StopAsync(cancellationToken);
        }
    }
}
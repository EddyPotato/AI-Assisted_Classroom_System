using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MQTTnet;
using MQTTnet.Client;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System;

namespace campus_backend.Services
{
    public class MqttListenerService : BackgroundService
    {
        private readonly ILogger<MqttListenerService> _logger;
        private readonly IAccessVerificationService _verificationService;
        private IMqttClient _mqttClient;

        public MqttListenerService(
            ILogger<MqttListenerService> logger,
            IAccessVerificationService verificationService) // Injecting the new logic layer!
        {
            _logger = logger;
            _verificationService = verificationService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var factory = new MqttFactory();
            _mqttClient = factory.CreateMqttClient();

            var options = new MqttClientOptionsBuilder()
                .WithTcpServer("localhost", 1883)
                .WithCleanSession()
                .Build();

            _mqttClient.ApplicationMessageReceivedAsync += HandleMessageAsync;

            _mqttClient.ConnectedAsync += async e =>
            {
                _logger.LogInformation("✅ Connected to MQTT Broker.");
                await _mqttClient.SubscribeAsync("campus/door/scan");
                await _mqttClient.SubscribeAsync("campus/door/verified");
            };

            _mqttClient.DisconnectedAsync += async e =>
            {
                _logger.LogWarning("⚠️ Disconnected from MQTT Broker. Reconnecting in 5s...");
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
                try { await _mqttClient.ConnectAsync(options, stoppingToken); } catch { }
            };

            try { await _mqttClient.ConnectAsync(options, stoppingToken); } 
            catch { _logger.LogError("❌ Failed to connect to MQTT on startup."); }

            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(1000, stoppingToken);
            }
        }

        private async Task HandleMessageAsync(MqttApplicationMessageReceivedEventArgs e)
        {
            string topic = e.ApplicationMessage.Topic;
            string payload = Encoding.UTF8.GetString(e.ApplicationMessage.PayloadSegment);
            
            _logger.LogInformation($"[MQTT] Received on {topic}: {payload}");

            // Delegate the heavy lifting to the new service!
            if (topic == "campus/door/scan")
            {
                await _verificationService.ProcessPhase1BarcodeAsync(payload);
            }
            else if (topic == "campus/door/verified")
            {
                await _verificationService.ProcessPhase2VerificationAsync(payload);
            }
        }
    }
}
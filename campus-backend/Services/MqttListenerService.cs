using System.Text;
using System.Linq;
using MQTTnet;
using Microsoft.AspNetCore.SignalR;
using campus_backend.Hubs;
using campus_backend.Repositories;

namespace campus_backend.Services
{
    public class MqttListenerService : BackgroundService
    {
        private readonly IMqttClient _mqttClient;
        private readonly IHubContext<CampusHub> _hubContext;
        private readonly IServiceScopeFactory _scopeFactory;

        public MqttListenerService(IHubContext<CampusHub> hubContext, IServiceScopeFactory scopeFactory)
        {
            _hubContext = hubContext;
            _scopeFactory = scopeFactory;
            
            // UPDATE 1: MqttFactory is now MqttClientFactory in v5
            var factory = new MqttClientFactory();
            _mqttClient = factory.CreateMqttClient();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var options = new MqttClientOptionsBuilder()
                .WithTcpServer("localhost", 1883)
                .Build();

            _mqttClient.ApplicationMessageReceivedAsync += async e =>
            {
                // UPDATE 2: Payload is already a byte[], pass it directly to GetString!
                var barcodeData = Encoding.UTF8.GetString(e.ApplicationMessage.Payload);
                
                Console.WriteLine($"[MQTT RECEIVED] ID: {barcodeData}");

                using (var scope = _scopeFactory.CreateScope())
                {
                    var repo = scope.ServiceProvider.GetRequiredService<IStudentRepository>();
                    var student = await repo.GetStudentByIdAsync(barcodeData);

                    if (student != null)
                    {
                        Console.WriteLine($"[ORACLE MATCH] {student.First_Name} {student.Last_Name}");
                        await _hubContext.Clients.All.SendAsync("ReceiveScanEvent", student);
                    }
                    else 
                    {
                        Console.WriteLine("[ORACLE MATCH] Access Denied: Unknown ID.");
                    }
                }
            };

            await _mqttClient.ConnectAsync(options, stoppingToken);
            
            var subscribeOptions = new MqttClientSubscribeOptionsBuilder()
                .WithTopicFilter("campus/door/scan")
                .Build();
                
            await _mqttClient.SubscribeAsync(subscribeOptions, stoppingToken);
        }
    }
}
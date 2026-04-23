using campus_backend.Hubs;
using campus_backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Register the Oracle Repository
builder.Services.AddScoped<campus_backend.Repositories.IStudentRepository, campus_backend.Repositories.StudentRepository>();

builder.Services.AddScoped<campus_backend.Repositories.IUserRepository, campus_backend.Repositories.UserRepository>();

builder.Services.AddScoped<campus_backend.Repositories.IRoomRepository, campus_backend.Repositories.RoomRepository>();

builder.Services.AddScoped<campus_backend.Repositories.IScheduleRepository, campus_backend.Repositories.ScheduleRepository>();

builder.Services.AddControllers();

// --- THE FIX: STRICT CORS FOR SIGNALR ---
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReactApp", policy => {
        policy.WithOrigins("http://localhost:5173") // Your React Frontend URL
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // CRITICAL: SignalR requires this to be true!
    });
});

// Register IoT Services
builder.Services.AddSignalR();
builder.Services.AddHostedService<MqttListenerService>();

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Apply the new CORS policy BEFORE mapping hubs/controllers
app.UseCors("AllowReactApp");

app.MapControllers();
app.MapHub<CampusHub>("/campushub");

app.Run();
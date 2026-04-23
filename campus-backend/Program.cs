using campus_backend.Hubs;
using campus_backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Register the Oracle Repository
builder.Services.AddScoped<campus_backend.Repositories.IStudentRepository, campus_backend.Repositories.StudentRepository>();

builder.Services.AddControllers();

// Configure CORS so React can talk to C#
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// --- THE MISSING IOT SERVICES ---
builder.Services.AddSignalR();
builder.Services.AddHostedService<MqttListenerService>();

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// CORS must be used before mapping the controllers and hubs
app.UseCors("AllowAll");

app.MapControllers();

// --- THE MISSING HUB ENDPOINT ---
app.MapHub<CampusHub>("/campushub");

app.Run();
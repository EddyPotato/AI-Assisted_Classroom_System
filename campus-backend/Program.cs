using campus_backend.Hubs;
using campus_backend.Services;
using Microsoft.Extensions.FileProviders; // Needed for serving static files

var builder = WebApplication.CreateBuilder(args);

// Register Repositories
builder.Services.AddScoped<campus_backend.Repositories.IStudentRepository, campus_backend.Repositories.StudentRepository>();

builder.Services.AddScoped<campus_backend.Repositories.IStaffRepository, campus_backend.Repositories.StaffRepository>(); // ADD THIS LINE

builder.Services.AddScoped<campus_backend.Repositories.IUserRepository, campus_backend.Repositories.UserRepository>();
builder.Services.AddScoped<campus_backend.Repositories.IRoomRepository, campus_backend.Repositories.RoomRepository>();
builder.Services.AddScoped<campus_backend.Repositories.IScheduleRepository, campus_backend.Repositories.ScheduleRepository>();

builder.Services.AddControllers();

builder.Services.AddCors(options => {
    options.AddPolicy("AllowReactApp", policy => {
        policy.WithOrigins("http://localhost:5173") 
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); 
    });
});

builder.Services.AddSignalR();
builder.Services.AddHostedService<MqttListenerService>();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");

// --- THE FIX: AUTO-CREATE FOLDER & SERVE IMAGES ---
var facesDirectory = Path.Combine(Directory.GetCurrentDirectory(), "ReferenceFaces");
if (!Directory.Exists(facesDirectory))
{
    Directory.CreateDirectory(facesDirectory); // Automatically creates the folder if missing!
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(facesDirectory),
    RequestPath = "/faces" // Now images are accessible at http://localhost:5106/faces/filename.jpg
});
// --------------------------------------------------

app.MapControllers();
app.MapHub<CampusHub>("/campushub");

app.Run();
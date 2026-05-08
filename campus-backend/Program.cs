using campus_backend.Hubs;
using campus_backend.Services;
using campus_backend.Repositories;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. DATABASE REPOSITORIES
// ==========================================
// Encapsulates all Oracle SQL logic into strictly typed interfaces.
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<IStaffRepository, StaffRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRoomRepository, RoomRepository>();
builder.Services.AddScoped<IScheduleRepository, ScheduleRepository>();
builder.Services.AddScoped<ISectionRepository, SectionRepository>();
builder.Services.AddScoped<IEnrollmentRepository, EnrollmentRepository>();
builder.Services.AddScoped<ISubjectRepository, SubjectRepository>();
builder.Services.AddScoped<ICourseRepository, CourseRepository>();
builder.Services.AddScoped<ICameraLocationRepository, CameraLocationRepository>();
builder.Services.AddScoped<IAttendanceRepository, AttendanceRepository>();

// ==========================================
// 2. BUSINESS LOGIC & CORE SERVICES
// ==========================================
// Handles file system operations (saving face references)
builder.Services.AddScoped<IImageUploadService, ImageUploadService>();

// The "State Machine Brain" for processing camera scans. 
// Registered as SINGLETON because the background MQTT service needs constant access to it.
builder.Services.AddSingleton<IAccessVerificationService, AccessVerificationService>();

// Enables HTTP calls to the Python Edge Nodes
builder.Services.AddHttpClient(); 

// ==========================================
// 3. API & MIDDLEWARE CONFIGURATION
// ==========================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Ensures JSON properties match React's camelCase expectations
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// Allow the React frontend to communicate with this C# Backend
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReactApp", policy => {
        policy.WithOrigins("http://localhost:5173") 
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); 
    });
});

// Real-time WebSockets (For Live Monitor UI updates)
builder.Services.AddSignalR();

// Background Service: Constantly listens to the Python AI over MQTT
builder.Services.AddHostedService<MqttListenerService>();

builder.Services.AddOpenApi();

// ==========================================
// 4. APP BUILD & PIPELINE
// ==========================================
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");

// --- STATIC FILE SERVER (Images) ---
// Automatically creates the directory if you deploy to a fresh server
var facesDirectory = Path.Combine(Directory.GetCurrentDirectory(), "ReferenceFaces");
if (!Directory.Exists(facesDirectory))
{
    Directory.CreateDirectory(facesDirectory); 
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(facesDirectory),
    RequestPath = "/ReferenceFaces" 
});

// --- ROUTING ---
app.MapControllers();
app.MapHub<CampusHub>("/campushub");

app.Run();
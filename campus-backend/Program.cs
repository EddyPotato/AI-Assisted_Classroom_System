using campus_backend.Hubs;
using campus_backend.Services;
using Microsoft.Extensions.FileProviders; // Needed for serving static files

var builder = WebApplication.CreateBuilder(args);

// Register Repositories
builder.Services.AddScoped<campus_backend.Repositories.IStudentRepository, campus_backend.Repositories.StudentRepository>();
builder.Services.AddScoped<campus_backend.Repositories.IStaffRepository, campus_backend.Repositories.StaffRepository>();
builder.Services.AddScoped<campus_backend.Repositories.IUserRepository, campus_backend.Repositories.UserRepository>();
builder.Services.AddScoped<campus_backend.Repositories.IRoomRepository, campus_backend.Repositories.RoomRepository>();
builder.Services.AddScoped<campus_backend.Repositories.IScheduleRepository, campus_backend.Repositories.ScheduleRepository>();

// ADD THESE TWO LINES:
builder.Services.AddScoped<campus_backend.Repositories.ISectionRepository, campus_backend.Repositories.SectionRepository>();
builder.Services.AddScoped<campus_backend.Repositories.IEnrollmentRepository, campus_backend.Repositories.EnrollmentRepository>();

builder.Services.AddScoped<campus_backend.Repositories.ISubjectRepository, campus_backend.Repositories.SubjectRepository>();

// ADD THIS EXACT LINE FOR COURSES:
builder.Services.AddScoped<campus_backend.Repositories.ICourseRepository, campus_backend.Repositories.CourseRepository>();

// 1. Enables HTTP calls to Python
builder.Services.AddHttpClient(); 

// 2. Registers the new Database Repository
builder.Services.AddScoped<campus_backend.Repositories.ICameraLocationRepository, campus_backend.Repositories.CameraLocationRepository>(); 

// 3. Registers the new Business Logic Service for MQTT
builder.Services.AddSingleton<campus_backend.Services.IAccessVerificationService, campus_backend.Services.AccessVerificationService>();

builder.Services.AddScoped<campus_backend.Repositories.IAttendanceRepository, campus_backend.Repositories.AttendanceRepository>();

builder.Services.AddScoped<IImageUploadService, ImageUploadService>();

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
    RequestPath = "/ReferenceFaces" // Make this match exactly!
});
// --------------------------------------------------

app.MapControllers();
app.MapHub<CampusHub>("/campushub");

app.Run();
using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.FileProviders;
using campus_backend.Hubs;
using campus_backend.Services;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. REPOSITORIES
// ==========================================
builder.Services.AddScoped<campus_backend.Repositories.IStudentRepository, campus_backend.Repositories.StudentRepository>();
builder.Services.AddScoped<campus_backend.Repositories.IStaffRepository, campus_backend.Repositories.StaffRepository>();
builder.Services.AddScoped<campus_backend.Repositories.IUserRepository, campus_backend.Repositories.UserRepository>();
builder.Services.AddScoped<campus_backend.Repositories.IRoomRepository, campus_backend.Repositories.RoomRepository>();
builder.Services.AddScoped<campus_backend.Repositories.IScheduleRepository, campus_backend.Repositories.ScheduleRepository>();
builder.Services.AddScoped<campus_backend.Repositories.ISectionRepository, campus_backend.Repositories.SectionRepository>();
builder.Services.AddScoped<campus_backend.Repositories.IEnrollmentRepository, campus_backend.Repositories.EnrollmentRepository>();
builder.Services.AddScoped<campus_backend.Repositories.ISubjectRepository, campus_backend.Repositories.SubjectRepository>();
builder.Services.AddScoped<campus_backend.Repositories.ICourseRepository, campus_backend.Repositories.CourseRepository>();
builder.Services.AddScoped<campus_backend.Repositories.ICameraLocationRepository, campus_backend.Repositories.CameraLocationRepository>();
builder.Services.AddScoped<campus_backend.Repositories.IAttendanceRepository, campus_backend.Repositories.AttendanceRepository>();
builder.Services.AddScoped<campus_backend.Repositories.IAcademicTermRepository, campus_backend.Repositories.AcademicTermRepository>();

// ==========================================
// 2. SERVICES
// ==========================================
builder.Services.AddScoped<IImageUploadService, ImageUploadService>();
// Singleton Brain for the State Machine
builder.Services.AddSingleton<IAccessVerificationService, AccessVerificationService>(); 
builder.Services.AddHttpClient(); 

// ==========================================
// 3. API & MIDDLEWARE CONFIGURATION
// ==========================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
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

builder.Services.AddSignalR();
builder.Services.AddHostedService<MqttListenerService>();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// IMPORTANT: CORS must happen BEFORE Static Files so the images aren't blocked!
app.UseCors("AllowReactApp");

// ==========================================
// 4. STATIC FILE SERVER (Images)
// ==========================================
// This explicitly targets your local C:\Users\EdTech\...\ReferenceFaces folder
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

// ==========================================
// 5. ROUTING
// ==========================================
app.MapControllers();
app.MapHub<CampusHub>("/campushub");

app.Run();
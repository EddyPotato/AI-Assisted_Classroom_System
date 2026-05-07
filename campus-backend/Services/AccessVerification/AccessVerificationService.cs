using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.SignalR;
using System;
using campus_backend.Hubs;
using Microsoft.Extensions.DependencyInjection;

namespace campus_backend.Services
{
    public partial class AccessVerificationService : IAccessVerificationService
    {
        private readonly ILogger<AccessVerificationService> _logger;
        private readonly IHubContext<CampusHub> _hubContext;
        private readonly string _connectionString;
        private readonly IServiceScopeFactory _scopeFactory;

        // Shared State across phases
        private string _pendingStudentId = "";
        private string _pendingFirstName = "";
        private string _pendingLastName = "";
        private string? _pendingFacePath = null;
        private string _currentLocationId = "CAM-001";

        public AccessVerificationService(
            ILogger<AccessVerificationService> logger,
            IHubContext<CampusHub> hubContext,
            IConfiguration configuration,
            IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _hubContext = hubContext;
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? configuration.GetConnectionString("OracleConnection")
                ?? configuration.GetConnectionString("OracleDb")
                ?? throw new InvalidOperationException("Connection string not found.");
            _scopeFactory = scopeFactory;
        }
    }
}
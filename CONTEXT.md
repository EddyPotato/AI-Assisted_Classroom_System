# AI-Assisted Smart Campus & Classroom System - Project Context

**Last updated:** May 8, 2026
**Current status:** Multi-role system with Faculty, Guard, Registrar, Principal, and SystemAdmin portals. Registrar schedule/import work is integrated, Section Directory is table-based. Authentication uses sessionStorage with a known localStorage inconsistency in Guard Portal.
**Team lead:** EddyPotato

This file is the working memory for the project. Read it before changing code, especially when touching schema-sensitive registrar logic or authentication state.

---

## Project Overview

The system is an integrated smart campus platform for:

- Role-based authentication and multi-tab session management
- Student and staff identity records with face reference paths
- Registrar section, roster, schedule, course, subject, room, and staff workflows
- Faculty class attendance tracking
- Guard Portal access monitoring with barcode/QR scan and face verification
- Principal dashboard for oversight
- SystemAdmin portal for system configuration
- Real-time updates through SignalR WebSockets
- Python edge-node camera processing through OpenCV, pyzbar, face_recognition, Flask, and MQTT
- Oracle Database persistence
- Image upload service for reference faces

Repo areas:

- `campus-dashboard/` - React 19.2.5 / Vite 8.0.9 frontend
- `campus-backend/` - ASP.NET Core (net10.0) API, SignalR hub, MQTT listener, Oracle repositories, face verification logic
- `campus-edge/` - Python 3.10+ camera/vision node with Flask server
- `database/` - Oracle schema (CAMPUS_ADMIN owner) and seed data

---

## Latest Work Completed

### Multi-Role Portal System

The frontend now supports five distinct role-based portals with separate workflows:

**Implemented roles:**
- **Faculty**: Dashboard, class attendance tracking, schedule view
- **Guard**: Real-time access monitoring, camera stream control, manual ID entry, barcode/QR scanning, face verification
- **Registrar**: Student/staff directories, section management, schedule management, subject/course resources, master schedule import
- **Principal**: Dashboard for oversight (structure in place)
- **SystemAdmin**: System configuration portal (structure in place)

Role dispatch is handled in `campus-dashboard/src/App.jsx` based on the `role` or `Role` field in the user object.

### Registrar Section Directory

The Section Directory was changed from cards to a table view for consistency with other registrar directories.

Key implementation details:

- Table columns: section, campus, program (course), year level, section letter, student count, and actions
- Rows support opening section roster or editing the section
- Sorting and filtering (by search, program, year) work on local table state
- Archive/restore UI was intentionally removed because `SECTIONS` table has no `STATUS` column
- `SectionRepository.GetAllSectionsAsync()` returns `CAMPUS` and `SECTION_LETTER` to prevent edit fidelity loss
- Location: `campus-dashboard/src/portals/Registrar/components/sections/`

### Registrar Schedule Management

Schedules support both CRUD operations and bulk import from CSV/Excel.

Key implementation details:

- **Read all schedules**: `GET /api/schedules` → `ScheduleRepository.GetAllSchedulesAsync()`
- **Create/Update/Delete**: Standard REST endpoints on `SchedulesController`
- **Bulk import**: `POST /api/schedules/bulk-import` accepts array of schedule objects
- CSV headers: `Subject_Code, Section_Id, Professor_Id, Room_Id, Time_Start, Time_End, Class_Days, Subject_Type`
- Bulk import validates required fields and uses nullable Oracle values for optional professor/room IDs
- Subject types: `Lec` (Lecture) or `Lab` (Laboratory)
- Time sorting across all schedules is numeric (not lexicographic)
- Location: `campus-dashboard/src/portals/Registrar/views/ScheduleImporter.jsx`

### Authentication State Management

**Current implementation**: Login stores the user object in `sessionStorage` under key `campus_user`.

**Known issue**: GuardPortal.jsx reads from `localStorage` instead of `sessionStorage`, causing a mismatch. This should be fixed to use sessionStorage consistently across all portals.

**Expected behavior** (once fixed):
- Logging in sets `sessionStorage.campus_user`
- Closing a browser tab clears the session
- Multi-tab role concurrency works: Tab A (Guard) + Tab B (Registrar) each have their own role
- No persistent login across browser restart

**Current workaround**: The mismatch currently allows some persistence in Guard Portal; this is a security consideration.

### Backend Authentication

Authentication in `AuthController.cs`:

- Accepts username/password POST to `/api/auth/login`
- Supports legacy plaintext passwords (auto-hashes on first valid login)
- Uses BCrypt.Net-Next (v4.1.0) for verification
- Returns user object with password scrubbed for security
- Password null-check prevents crashes if database password is unset

---

## Verification

Passing as of May 7, 2026:

```powershell
cd campus-dashboard
npm.cmd run lint
npm.cmd run build
```

```powershell
cd ..
dotnet build campus-backend\campus-backend.csproj
```Current Issues & Notes

### sessionStorage/localStorage Inconsistency

- **Login.jsx** stores auth in `sessionStorage`
- **GuardPortal.jsx** reads auth from `localStorage`
- **App.jsx** reads auth from `sessionStorage`

This causes GuardPortal to lose its user context unless localStorage was populated externally. **Action needed**: Update GuardPortal.jsx to use sessionStorage.

### API Endpoint Verification

All 12 controllers are implemented and registered in `Program.cs`:
- AttendanceController (classroom attendance logs)
- AuthController (login)
- CameraController (stream management)
- CoursesController
- EnrollmentsController (section rosters)
- RoomsController
- SchedulesController
- SectionsController
- StaffController
- StudentCon `http://localhost:5173`

Directory structure:

```text
campus-dashboard/src/
  App.jsx (role-based routing)
  main.jsx
  index.css
  api/ (currently empty; API calls are inline)
  components/
    auth/
      Login.jsx
      LoginHeader.jsx
      LoginForm.jsx
    ui/
      Header.jsx
      Sidebar.jsx
  portals/
    Faculty/
      FacultyDashboard.jsx
      ClassAttendance.jsx
    Guard/
      GuardPortal.jsx
      components/
        GuardHeader.jsx
        LiveMonitorView.jsx
        AccessHistory.jsx
      views/
    Principal/
      PrincipalPortal.jsx
    Registrar/
      RegistrarPortal.jsx
      views/
        ScheduleImporter.jsx
      components/
        schedules/ (table-based schedules directory)
        sections/ (table-based sections directory with roster)
        users/ (student, staff directories)
        faculty/
        resources/ (subjects, courses)
        enrollment/
    SystemAdmin/
      SystemAdminPortal.jsx
```

Key authentication flow:
1. User logs in at `/login` (sessionStorage-based)
2. `App.jsx` dispatches to role portal based on `user.role` or `user.Role`
3. Each portal has independent state management
4. Logout not yet implemented; relies on tab closure for session clearance

### Backend

Stack:

- ASP.NET Core targeting `net10.0`
- Oracle.ManagedDataAccess.Core `23.26.200`
- BCrypt.Net-Next `4.1.0`
- MQTTnet `4.3.7.1207`
- SignalR (real-time notifications)
- Newtonsoft.Json (JSON configuration)

Default URL: `http://localhost:5106`

CORS: Configured for `http://localhost:5173` with credentials

Directory structure:

```text
campus-backend/
  Controllers/ (12 controllers)
    AttendanceController.cs
    AuthController.cs
    CameraController.cs
    CoursesController.cs
    EnrollmentsController.cs
    RoomsController.cs
    SchedulesController.cs
    SectionsController.cs
    StaffController.cs
    StudentController.cs
    SubjectsController.cs
    UserController.cs
  Hubs/
    CampusHub.cs (SignalR: ReceiveBarcode, ReceiveScanResult, etc.)
  Models/
    CameraDTOs.cs, CameraLocation.cs
    Course.cs, Schedule.cs, ScheduleModels.cs
    Section.cs, SectionModels.cs
    Student.cs, Staff.cs, User.cs
    Subject.cs, Room.cs, EnrollmentModels.cs
    LoginRequest.cs
  Repositories/ (Repository pattern, Oracle queries)
    IAttendanceRepository, IEnrollmentRepository, ISectionRepository
    IScheduleRepository, IStudentRepository, IStaffRepository
    ICourseRepository, IRoomRepository, ISubjectRepository
    ICameraLocationRepository, IUserRepository
    [Concrete implementations]
  Services/
    AccessVerificationService.cs (state machine for guard verification logic)
    IImageUploadService, ImageUploadService.cs
    MqttListenerService.cs (MQTT subscriber for edge node events)
  ReferenceFaces/ (static file directory for face reference images)
  Properties/
    launchSettings.json
  appsettings.json (Oracle connection string, CORS config)
  Program.cs (DI, SignalR, MQTT, static file hosting)
```

Key service integrations:
- **MqttListenerService**: Listens to `campus/events/` topic for camera events from Python edge node
- **SignalR/CampusHub**: Broadcasts `ReceiveBarcode`, `ReceiveScanResult` to connected clients
- **AccessVerificationService**: State machine for guard verification (face match, barcode, bypass logic)

### Edge Node (Python)

Stack:

- Python 3.10+
- OpenCV `4.9.0+`
- face_recognition `1.3.0+`
- pyzbar `0.1.9+`
- Flask `3.0.3+`
- paho-mqtt `1.6.1+`

Default URLs:

```text
http://localhost:5000 (Flask server)
http://localhost:5000/video_feed (MJPEG stream)
POST http://localhost:5000/start_camera (Guard Portal requests)
POST http://localhost:5000/stop_camera
```

Responsibilities:

- Manage webcam based on Guard Portal requests
- Serve live MJPEG feed
- Scan and decode barcodes/QR codes in real-time
- Compare detected faces against reference images in `campus-backend/ReferenceFaces/`
- Publish scan results to MQTT broker
- Report confidence scores and match status

Key configuration (`config.py`):

```text
REFERENCE_FACES_DIR = campus-backend/ReferenceFaces/
MQTT_BROKER = localhost
CAMERA_INDEX = 0 (default)
CAMERA_WIDTH = 960, HEIGHT = 540, FPS = 15
FACE_MATCH_TIMEOUT = 6.0 seconds
STRICT_THRESHOLD = 0.45
```

---

## Database Schema

Use `database/schema.sql` as the source of truth. Last updated: May 8, 2026.

Schema owner: `CAMPUS_ADMIN`

Oracle connection string (appsettings.json):

```json
{
  "ConnectionStrings": {
    "OracleConnection": "Data Source=localhost:1521/XEPDB1;User Id=campus_admin;Password=admin123;"
  }
}
```

### Core Tables (11 tables)

| Table | Purpose | Key Columns |
|---|---|---|
| **USERS** | Faculty, staff, admin accounts | USER_ID (PK), ROLE, PASSWORD (BCrypt), FACE_REFERENCE_PATH |
| **STUDENTS** | Student records | STUDENT_ID (PK), FIRST_NAME, LAST_NAME, FACE_REFERENCE_PATH, ENROLLMENT_STATUS, CAMPUS_PRESENCE |
| **SECTIONS** | Class sections | SECTION_ID (PK), CAMPUS, COURSE, YEAR_LEVEL, SECTION_LETTER, SECTION_NAME |
| **ENROLLMENTS** | Student-to-section mapping | ENROLLMENT_ID (PK), STUDENT_ID (FK), SECTION_ID (FK), CONSECUTIVE_ABSENCES |
| **SCHEDULES** | Class schedule events | SCHEDULE_ID (PK), SUBJECT_CODE (FK), SECTION_ID (FK), PROFESSOR_ID (FK), ROOM_ID (FK), TIME_START, TIME_END, CLASS_DAYS, SUBJECT_TYPE |
| **SUBJECTS** | Courses/subjects | SUBJECT_CODE (PK), TITLE, PREREQUISITES, UNITS |
| **COURSES** | Programs (BSIT, BSCS, etc.) | COURSE_CODE (PK), COURSE_NAME, DEPARTMENT |
| **ROOMS** | Classroom/lab rooms | ROOM_ID (PK), BUILDING, FLOOR, ROOM_TYPE, STATUS, CAMPUS |
| **CAMPUSES** | Campus locations | CAMPUS_CODE (PK), CAMPUS_NAME, IS_MAIN |
| **CAMERA_LOCATIONS** | Camera configuration | LOCATION_ID (PK), CAMERA_NAME, LOCATION_TYPE (entrance/exit/room), ASSOCIATED_ROOM_ID (FK), IS_ACTIVE, LOGIC_TYPE (gate/room) |
| **EVENT_LOGS** | Access/attendance events | LOG_ID (PK), STUDENT_ID (FK), STATUS, MATCH_CONFIDENCE, TIMESTAMP, BYPASS_REASON, LOCATION_ID (FK) |

### Important Column Notes

**SECTIONS**: No `STATUS` column. Archive/restore UI cannot be implemented without first adding a real schema column.

**SCHEDULES**: 
- `SUBJECT_TYPE` defaults to `'Lec'`; supports `'Lab'` as well
- Time columns (`TIME_START`, `TIME_END`) are VARCHAR2, not TIMESTAMP (e.g., `'02:30 PM'`)
- Foreign keys reference existing SUBJECTS, USERS, ROOMS, SECTIONS

**EVENT_LOGS**: 
- `STATUS` values in seed data: `'approved'`, `'denied'`, `'Access Granted'` (inconsistent; should normalize)
- `MATCH_CONFIDENCE` is NULL for manual ID or bypass
- `BYPASS_REASON` is NULL unless bypass was granted

**STUDENTS** & **USERS**: 
- Both have `FACE_REFERENCE_PATH` (path to stored face reference image)
- `CAMPUS_PRESENCE` tracks online/offline (set by frontend in real-time)

**CAMERA_LOCATIONS**: 
- `LOGIC_TYPE` determines verification strategy at that location
- `ASSOCIATED_ROOM_ID` links room cameras to specific rooms

---

## Key API Endpoints

### Authentication
```
POST   /api/auth/login           Login with username/password
```

### Students & Staff
```
GET    /api/student              List all students
GET    /api/student/{id}         Get student by ID
GET    /api/staff                List all staff
GET    /api/staff/{id}           Get staff by ID
```

### Sections
```
GET    /api/sections             List all sections
POST   /api/sections             Create section
PUT    /api/sections/{id}        Update section
DELETE /api/sections/{id}        Delete section
GET    /api/sections/{id}/students       Get students in section
POST   /api/sections/{id}/students       Add students to section
DELETE /api/sections/{sectionId}/students/{studentId}  Remove student
```

### Schedules
```
GET    /api/schedules            List all schedules
POST   /api/schedules            Create schedule
PUT    /api/schedules/{id}       Update schedule
DELETE /api/schedules/{id}       Delete schedule
POST   /api/schedules/bulk-import        Bulk import from CSV
```

### Rooms, Courses, Subjects
```
GET    /api/rooms                List rooms
GET    /api/courses              List courses
GET    /api/subjects             List subjects
```

### Attendance & Events
```
GET    /api/attendance           List attendance logs
GET    /api/enrollments          List enrollments
```

### Camera & Guard Portal
```
GET    /api/camera/locations     List camera locations
POST   /api/camera/start         Start camera stream
POST   /api/camera/stop          Stop camera stream
POST   /api/camera/verify        Verify barcode or face
```

### Real-time (SignalR WebSocket)
```
http://localhost:5106/campushub
  ReceiveBarcode(data)           Broadcast barcode scan result
  ReceiveScanResult(data)        Broadcast face verification result
```

---

## MQTT Topics

Python edge node publishes verification events:

```
campus/door/scan              Barcode/QR code data
campus/door/verified          Face match result
campus/events/               General event stream
```

Backend MqttListenerService subscribes and re-broadcasts to SignalR.

---

## Troubleshooting & Common Issues

### sessionStorage/localStorage Auth Mismatch
GuardPortal reads from `localStorage` while Login stores to `sessionStorage`. This causes GuardPortal to lose context. **Action**: Update GuardPortal.jsx line 11 to use `sessionStorage`.

### Backend DLL/EXE Lock Error
A previous `dotnet run` or Visual Studio instance is still running.

```powershell
Get-Process campus-backend -ErrorAction SilentlyContinue | Stop-Process
dotnet build campus-backend\campus-backend.csproj
```

### Port Conflict
```powershell
netstat -ano | findstr :5106  # Check who owns port 5106
Get-Process -Id <PID>
```

### PowerShell npm.cmd Execution Policy
Use `npm.cmd` instead of `npm` to avoid execution policy blocks:

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
```

### Oracle Connection String Not Found
Ensure `appsettings.json` has:
```json
"ConnectionStrings": { "OracleConnection": "..." }
```

And code uses a fallback:
```csharp
config.GetConnectionString("OracleConnection") ?? throw new Exception("...");
```

### Python Edge Node Connection Fails
- Check Python is running: `curl http://localhost:5000`
- Check MQTT broker is accessible (if configured)
- Check camera hardware is available: `python -c "import cv2; print(cv2.VideoCapture(0).isOpened())"`

### Frontend Chunk Size Warning
This is normal. The Vite production bundle is ~600+ kB after minification. Not a breaking error; the app runs fine.

---

## Next Development Priorities

1. **Fix Guard Portal sessionStorage issue**: Update GuardPortal.jsx to read from sessionStorage instead of localStorage.
2. **Test Registrar workflows**: CSV schedule import, section CRUD, roster management.
3. **Full Guard Portal integration test**: Run all services (Oracle, MQTT, backend, frontend, edge node) together and test real-time barcode/face verification.
4. **Add schedule conflict detection**: Bulk import should warn about overlapping schedules.
5. **Normalize EVENT_LOGS.STATUS values**: Define enum (APPROVED, DENIED, BYPASSED, etc.) and backfill data.
6. **Consider section archive feature**: Only if SECTIONS.STATUS column is intentionally added to schema.
7. **Add Principal & SystemAdmin portal implementations**: Flesh out navigation and key workflows.
8. **Optimize frontend bundle**: Code-split and lazy load portals to reduce initial chunk size.

---

## Files Not in Git

- `campus-edge/.env` (MQTT credentials)
- `campus-edge/.venv/` (Python virtual environment)
- `campus-backend/bin/`, `campus-backend/obj/` (build artifacts)
- `campus-dashboard/node_modules/` (npm packages)
- `.git/` (Git metadata)

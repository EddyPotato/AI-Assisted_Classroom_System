# AI-Assisted Smart Campus & Classroom System

**Complete, Production-Ready Multi-Role Campus Management Platform**

**Status:** ✅ May 14, 2026 - All systems functional and tested | Full dependency audit completed  
**Built With:** React 19.2.5 + Vite | ASP.NET Core 10 | Oracle | Python 3.10+ with OpenCV | MQTT Mosquitto  
**Team:** EddyPotato & Contributors  
**Documentation:** See [DEPENDENCIES_AUDIT.md](DEPENDENCIES_AUDIT.md) | [MQTT_SETUP_GUIDE.md](MQTT_SETUP_GUIDE.md) | [DEPENDENCIES_SUMMARY.md](DEPENDENCIES_SUMMARY.md)

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Installation & Setup](#installation--setup)
7. [Running the System](#running-the-system)
8. [API Endpoints](#api-endpoints)
9. [Feature Guides](#feature-guides)
10. [Troubleshooting](#troubleshooting)
11. [Development](#development)
12. [Deployment](#deployment)

---

## Overview

A comprehensive intelligent campus management system integrating:

- **Role-Based Multi-Portal System** — Faculty, Guard, Registrar, Principal, SystemAdmin with dedicated workflows
- **Smart Access Control** — Real-time barcode scanning & face recognition with MQTT/SignalR real-time updates
- **Registrar Management** — Complete section, roster, schedule, and enrollment management with bulk import
- **Attendance Tracking** — Faculty class attendance & Guard Portal access logging with face confidence scoring
- **Scalable Architecture** — Repository pattern, SignalR WebSockets, Oracle persistence, Python edge processing

**Key Value Propositions:**
- ✅ Hands-on, practical code patterns (Repository, DI, error handling)
- ✅ Real-world full-stack workflow (frontend → backend → database → edge node)
- ✅ Modern tech stack (React + .NET Core + Oracle)
- ✅ Production-ready security (BCrypt passwords, CORS, authentication)
- ✅ Comprehensive documentation for vibe coding

---

## Features

### Faculty Portal ✅
- Dashboard with class overview
- Student roster management
- Attendance tracking interface
- Schedule view by class

### Guard Portal ✅
- Real-time camera stream (MJPEG)
- Barcode/QR code scanning
- Face verification with confidence scoring
- Manual ID entry fallback
- Access history with timestamp & bypass reason
- 6-second two-phase verification (barcode + face)

### Registrar Portal ✅
- **Section Management:** Create, read, update, delete sections
- **Section Roster:** View/manage enrolled students per section
- **Schedule Management:** CRUD operations on class schedules
- **Bulk Schedule Import:** CSV/Excel upload with preview & validation
- **Student/Staff Directories:** Searchable records with contact info
- **Enrollment Management:** Bulk add/remove students from sections
- **Resources:** Subject and course directory

### Principal Portal 🔶
- Dashboard structure in place
- Workflows to be implemented

### SystemAdmin Portal 🔶
- System configuration structure in place
- Admin tools TBD

---

## Tech Stack

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| React | 19.2.5 | UI framework |
| Vite | 8.0.9 | Dev server & bundler |
| React Router | 7.14.2 | SPA routing |
| Tailwind CSS | 4.2.4 | Styling |
| @microsoft/signalr | 10.0.0 | Real-time WebSocket client |
| Lucide React | 1.8.0 | Icon library |

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| .NET | 10.0 | Web framework |
| Oracle.ManagedDataAccess | 23.26.200 | Database driver |
| BCrypt.Net-Next | 4.1.0 | Password hashing |
| MQTTnet | 4.3.7.1207 | MQTT client for edge node events |
| SignalR | Built-in | Real-time communication |

### Database
| Tool | Version | Purpose |
|------|---------|---------|
| Oracle Database | 21c XE | Persistence (XEPDB1 instance) |

### Edge Node (Python)
| Library | Version | Purpose |
|---------|---------|---------|
| OpenCV | 4.9.0+ | Video capture & frame processing |
| face_recognition | 1.3.0+ | Face detection & encoding |
| pyzbar | 0.1.9+ | Barcode/QR code scanning |
| Flask | 3.0.3+ | Web server for MJPEG stream |
| paho-mqtt | 1.6.1+ | MQTT client for publishing events |

---

## Project Structure

```
AI-Assisted_Classroom_System/
├── README.md                                 # This file
├── CONTEXT.md                                # Comprehensive technical reference (for vibe coding)
├── DEPENDENCIES_AUDIT.md                      # Complete dependency audit (all packages & versions)
├── MQTT_SETUP_GUIDE.md                       # MQTT Mosquitto installation (critical component)
├── DEPENDENCIES_SUMMARY.md                    # Executive summary of audit findings
├── AI-Assisted_Classroom_System.sln          # Visual Studio solution
│
├── database/
│   └── schema.sql                            # Oracle DDL + seed data
│
├── campus-backend/                           # ASP.NET Core REST API
│   ├── Controllers/                          # 12 API controllers
│   ├── Repositories/                         # Data access layer (Repository pattern)
│   ├── Models/                               # Data transfer objects
│   ├── Services/                             # Business logic (AccessVerification, MQTT, Image Upload)
│   ├── Hubs/                                 # SignalR real-time hub
│   ├── ReferenceFaces/                       # Face reference images directory
│   ├── Program.cs                            # Startup & dependency injection
│   ├── appsettings.json                      # Configuration
│   └── campus-backend.csproj
│
├── campus-dashboard/                         # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx                           # Master router + role dispatcher
│   │   ├── components/
│   │   │   ├── auth/                         # Login components
│   │   │   └── ui/                           # Header, Sidebar
│   │   └── portals/
│   │       ├── Faculty/                      # Faculty dashboard & attendance
│   │       ├── Guard/                        # Access monitoring portal
│   │       ├── Registrar/                    # Section, schedule, enrollment management
│   │       ├── Principal/                    # Principal dashboard
│   │       └── SystemAdmin/                  # System configuration
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
└── campus-edge/                              # Python camera & vision node
    ├── app.py                                # Flask web server
    ├── vision.py                             # Face detection & barcode scanning
    ├── camera.py                             # Webcam control
    ├── config.py                             # Configuration
    ├── requirements.txt                      # Python dependencies
    └── .env                                  # MQTT credentials (not in git)
```

---

## Prerequisites

### System Requirements
- **Windows 10/11** or **macOS/Linux**
- **RAM:** 4GB minimum (8GB recommended)
- **Disk Space:** 2GB for dependencies + code
- **Webcam:** Required for Guard Portal face verification

### Software Requirements

#### Database
- **Oracle Database 21c XE** (or compatible)
- **SQL*Plus** or **Oracle SQL Developer** (for schema import)

#### Backend
- **.NET SDK 10.0** or later
- **Visual Studio 2022** (recommended) or **VS Code** with C# extension

#### Frontend
- **Node.js 18+** (for npm)
- **npm 8+**

#### Edge Node
- **Python 3.10+**
- **pip** (Python package manager)

#### ⚠️ CRITICAL: MQTT Mosquitto Broker
- **MQTT Mosquitto 1.6+** (lightweight message broker - **MUST be running for system to function**)
- **Windows:** `choco install mosquitto` (Chocolatey) or download from https://mosquitto.org/download/
- **Linux:** `sudo apt-get install mosquitto mosquitto-clients`
- **macOS:** `brew install mosquitto`

**Why Critical:** Campus edge node publishes real-time barcode scans and face verification events via MQTT to the backend. Without MQTT broker running, the entire real-time system fails. See [MQTT_SETUP_GUIDE.md](MQTT_SETUP_GUIDE.md) for complete installation & verification steps.

### Credentials

**Oracle:**
```
User: campus_admin
Password: admin123
Host: localhost:1521
Database: XEPDB1
```

**Test Users (from seed data):**
- Registrar: `registrar1` / `password`
- Faculty: `prof-001` / `password`
- Guard: `guard1` / `password`
- Principal: `principal1` / `password`
- SystemAdmin: `admin1` / `password`

---

## Installation & Setup

### ⚠️ IMPORTANT: Installation Order

**Install components in this exact sequence for successful system startup:**

1. **System prerequisites** (Python, Node.js, .NET, Oracle) - One-time setup
2. **MQTT Mosquitto broker** - CRITICAL, must be installed & running first
3. **Database setup** - Oracle schema import
4. **Backend setup** - .NET restore & build
5. **Frontend setup** - npm install
6. **Edge node setup** - Python virtual environment & requirements
7. **Start services** in order: MQTT → Backend → Frontend → Edge Node

**See:** [DEPENDENCIES_AUDIT.md](DEPENDENCIES_AUDIT.md#phase-1-system-prerequisites) for complete step-by-step guide with all verification commands.

### 0. MQTT Mosquitto Setup (Required First!)

**Quick Install:**

```powershell
# Windows
choco install mosquitto

# Linux (Ubuntu/Debian)
sudo apt-get update && sudo apt-get install -y mosquitto mosquitto-clients

# macOS
brew install mosquitto
```

**Verify Installation:**
```bash
mosquitto --version          # Should show version 2.0.x
netstat -an | grep 1883      # Should show LISTENING on port 1883
```

**Start MQTT Broker:**
```bash
# Windows (auto-starts as service)
# Verify: Get-Service mosquitto

# Linux
sudo systemctl start mosquitto
sudo systemctl enable mosquitto  # Auto-start on boot

# macOS
brew services start mosquitto
```

**Test MQTT Connection:**
```bash
mosquitto_sub -h localhost -p 1883 -t "campus/#"
# Should connect and wait for messages
```

**See:** [MQTT_SETUP_GUIDE.md](MQTT_SETUP_GUIDE.md) for comprehensive setup, troubleshooting, and platform-specific instructions.

### 1. Database Setup

#### Option A: Using SQL*Plus
```powershell
# Start Oracle XE (if not already running)
# On Windows
sqlplus campus_admin/admin123@localhost:1521/XEPDB1

# In SQL*Plus prompt
> @database\schema.sql
> COMMIT;
> EXIT;
```

#### Option B: Using Oracle SQL Developer
1. Open SQL Developer
2. Create new connection: `localhost:1521/XEPDB1` as `campus_admin` / `admin123`
3. File → Open → Select `database/schema.sql`
4. Execute Script (F5)
5. Verify: `SELECT COUNT(*) FROM USERS;` (should return 5)

#### Verification
```sql
-- Verify tables exist
SELECT table_name FROM user_tables WHERE owner='CAMPUS_ADMIN';

-- Should see: USERS, STUDENTS, SECTIONS, ENROLLMENTS, SCHEDULES, SUBJECTS, COURSES, ROOMS, CAMPUSES, CAMERA_LOCATIONS, EVENT_LOGS

-- Verify seed data
SELECT COUNT(*) FROM USERS;        -- Should be 5 (or more)
SELECT COUNT(*) FROM STUDENTS;     -- Should be 6 (or more)
SELECT COUNT(*) FROM SECTIONS;     -- Should be 1 (or more)
```

### 2. Backend Setup

```powershell
cd campus-backend

# Restore NuGet packages
dotnet restore

# Verify Oracle connection in appsettings.json
# Should contain:
# "ConnectionStrings": {
#   "OracleConnection": "Data Source=localhost:1521/XEPDB1;User Id=campus_admin;Password=admin123;"
# }

# Build
dotnet build campus-backend.csproj

# Run (starts Kestrel on port 5106)
dotnet run
```

**Expected Output:**
```
info: Microsoft.AspNetCore.Hosting.Hostings Hosting started
Application started. Press Ctrl+C to stop.
Listening on http://localhost:5106
```

**Verify:** `curl http://localhost:5106` should respond (or navigate to browser)

### 3. Frontend Setup

```powershell
cd campus-dashboard

# Install dependencies (first time only)
npm install

# Start development server (hot-reload enabled)
npm.cmd run dev
```

**Expected Output:**
```
VITE v8.0.9
Local: http://localhost:5173/
```

**Verify:** Open browser to `http://localhost:5173` → Should see Login page

### 4. Edge Node Setup (Optional, for Guard Portal)

```powershell
cd campus-edge

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify camera access
python -c "import cv2; cap = cv2.VideoCapture(0); print('Camera ready' if cap.isOpened() else 'Camera not found')"

# Run Flask server
python app.py
```

**Expected Output:**
```
Running on http://localhost:5000
```

**Verify:** `curl http://localhost:5000/video_feed` should return MJPEG stream

---

## Running the System

### ⚠️ CRITICAL: Startup Order

**MQTT Mosquitto MUST be started first. Services depend on it being available.**

### Quick Start (All Services)

**Terminal 1 - MQTT Broker (Start First!):**
```powershell
# Windows
net start mosquitto
# Or if configured as auto-start service, verify it's running:
Get-Service mosquitto

# Linux
sudo systemctl start mosquitto

# macOS
brew services start mosquitto

# Verify
mosquitto_sub -h localhost -p 1883 -t "campus/#"
# Should connect successfully
```

**Terminal 2 - Backend:**
```powershell
cd campus-backend
dotnet run
# Should show: Now listening on https://localhost:5106
```

**Terminal 3 - Frontend:**
```powershell
cd campus-dashboard
npm.cmd run dev
# Should show: Local: http://localhost:5173
```

**Terminal 4 - Edge Node (Optional, for Guard Portal):**
```powershell
cd campus-edge
venv\Scripts\activate
python app.py
# Should show: Running on http://localhost:5000
```

### Access the System

1. **Frontend:** http://localhost:5173/login (once MQTT + Backend + Frontend all running)
2. **Backend API:** http://localhost:5106 (no web UI, API only)
3. **Edge Node:** http://localhost:5000/video_feed (MJPEG stream, only if running)

**Troubleshooting:**
- If frontend won't connect: Verify MQTT broker is running (`netstat -an | grep 1883`)
- If backend won't start: Verify MQTT broker is running and Oracle database is accessible
- See [MQTT_SETUP_GUIDE.md](MQTT_SETUP_GUIDE.md) for detailed troubleshooting

### Login

Use one of the test user credentials:

| Role | Username | Password | Access |
|------|----------|----------|--------|
| Registrar | `registrar1` | `password` | Section/Schedule/Enrollment management |
| Faculty | `prof-001` | `password` | Attendance tracking & class roster |
| Guard | `guard1` | `password` | Access monitoring & face verification |
| Principal | `principal1` | `password` | Dashboard (workflows TBD) |
| SystemAdmin | `admin1` | `password` | System configuration (tools TBD) |

---

## API Endpoints

### Base URL: `http://localhost:5106`

### Authentication

**POST /api/auth/login**
```json
Request:  { "username": "registrar1", "password": "password" }
Response: { "message": "Login successful", "user": { ...user object... } }
```

### Students

**GET /api/student** — List all students  
**GET /api/student/{id}** — Get specific student

### Sections

**GET /api/sections** — List all sections  
**POST /api/sections** — Create section  
**PUT /api/sections/{id}** — Update section  
**DELETE /api/sections/{id}** — Delete section  
**GET /api/sections/{id}/students** — Get enrolled students  
**POST /api/sections/{id}/students** — Bulk enroll students  
**DELETE /api/sections/{sectionId}/students/{studentId}** — Remove student  
**GET /api/sections/{id}/schedule** — Get section schedule

### Schedules

**GET /api/schedules** — List all schedules  
**POST /api/schedules** — Create schedule  
**PUT /api/schedules/{id}** — Update schedule  
**DELETE /api/schedules/{id}** — Delete schedule  
**POST /api/schedules/import** — Bulk import from array

### Other Resources

**GET /api/courses** — List all courses  
**GET /api/subjects** — List all subjects  
**GET /api/rooms** — List all rooms  
**GET /api/staff** — List all staff  
**GET /api/attendance** — List attendance logs  
**GET /api/enrollments** — List enrollments  
**GET /api/camera/locations** — List camera locations  

### Real-Time (SignalR)

**WebSocket:** `ws://localhost:5106/campushub`

Methods:
- `ReceiveBarcode(data)` — Barcode scan event
- `ReceiveScanResult(data)` — Face verification result

---

## Feature Guides

### Faculty Portal: Class Attendance

1. **Login** as `prof-001` / `password`
2. **Dashboard** shows list of classes assigned to faculty
3. **Click a class** → View roster with students
4. **Mark attendance** using date picker & student checkboxes
5. **Submit** → Attendance logged to database

### Guard Portal: Access Monitoring

1. **Login** as `guard1` / `password`
2. **Live Monitor View** displays:
   - Camera stream (if edge node running)
   - Real-time barcode/face verification status
   - Last scan timestamp
3. **Scan barcode/QR code** → Student identified instantly (Phase 1)
4. **Face verification** runs in background (Phase 2, 6-second window)
5. **Access granted** if barcode succeeds OR face confidence ≥ 0.45
6. **Access history** shows all scans with timestamp, status, confidence

### Registrar Portal: Section Management

1. **Login** as `registrar1` / `password`
2. **Sections Tab**:
   - View all sections in table
   - Filters: Campus, Year Level, Search
   - Actions: View Roster, Edit, Delete

3. **View Roster**:
   - See all enrolled students
   - Button: Add Students (select & enroll multiple)
   - Button: Remove Student (unenroll individual)

4. **Edit Section**:
   - Modify: Campus, Course, Year Level, Section Letter
   - Must be unique per course/year/letter combination

### Registrar Portal: Schedule Management

1. **Schedules Tab**:
   - View all schedules in sortable table
   - Click column headers to sort
   - Actions: Create, Edit, Delete, Bulk Import

2. **Create/Edit Schedule**:
   - Fill all required fields: Subject Code, Section, Time Start/End, Days
   - Optional: Professor ID, Room ID
   - Subject Type: Lec (Lecture) or Lab
   - Save → Schedule created/updated in database

3. **Bulk Import**:
   - Click "Import Schedules"
   - Select CSV/Excel file with columns:
     ```
     Subject_Code,Section_Id,Professor_Id,Room_Id,Time_Start,Time_End,Class_Days,Subject_Type
     SE101,SEC-001,prof-001,IK604,02:30 PM,05:30 PM,Monday/Wednesday,Lec
     ```
   - Preview parsed data in table
   - Click "Import" → All schedules inserted into database
   - Success message shows count imported

### Registrar Portal: Student Enrollment

1. **Sections Tab** → **View Roster**
2. **Add Students**:
   - Click "Add Students" button
   - Multi-select searchable student list
   - Click "Enroll" → Students added to section
   
3. **Remove Student**:
   - Click remove icon next to student in roster
   - Confirm → Student unenrolled

---

## Troubleshooting

### "Cannot connect to Oracle database"

**Error:** `ORA-12514: TNS:listener does not currently know of service requested in connect descriptor`

**Solutions:**
1. Verify Oracle XE is running
2. Check `appsettings.json` connection string:
   ```json
   "OracleConnection": "Data Source=localhost:1521/XEPDB1;User Id=campus_admin;Password=admin123;"
   ```
3. Test connection with SQL*Plus:
   ```powershell
   sqlplus campus_admin/admin123@localhost:1521/XEPDB1
   ```

### "Port 5106 already in use"

**Error:** `Address already in use`

**Solution:**
```powershell
# Find process using port 5106
netstat -ano | findstr :5106

# Kill the process (replace <PID> with actual process ID)
taskkill /PID <PID> /F

# Or use lsof on macOS/Linux
lsof -i :5106
kill -9 <PID>
```

### "npm is not recognized"

**Error:** `npm: command not found` or execution policy error

**Solutions:**
1. Use `npm.cmd` instead of `npm` on Windows PowerShell:
   ```powershell
   npm.cmd run dev
   npm.cmd run build
   ```

2. Install Node.js from https://nodejs.org (includes npm)

3. Check npm version:
   ```powershell
   npm --version
   ```

### "Guard Portal loses user context on reload"

**Issue:** GuardPortal reads from `localStorage` while Login uses `sessionStorage`

**Temporary Workaround:** Don't reload page in Guard Portal

**Permanent Fix:** Update `GuardPortal.jsx` line 11:
```javascript
// OLD (WRONG)
const user = JSON.parse(localStorage.getItem('campus_user'));

// NEW (CORRECT)
const user = JSON.parse(sessionStorage.getItem('campus_user'));
```

### "Camera not working in Guard Portal"

**Checklist:**
1. ✅ Edge node running: `python campus-edge/app.py`
2. ✅ Webcam connected & recognized:
   ```powershell
   python -c "import cv2; print(cv2.VideoCapture(0).isOpened())"
   ```
3. ✅ MQTT broker running (if configured)
4. ✅ Backend can reach edge node: `curl http://localhost:5000/video_feed`
5. ✅ Check browser console (F12) for JavaScript errors

### "Schedule import fails with 'Invalid foreign key'"

**Issue:** Schedule references non-existent Subject, Section, Room, or Professor

**Solutions:**
1. Verify all Subject Codes exist in SUBJECTS table:
   ```sql
   SELECT SUBJECT_CODE FROM SUBJECTS;
   ```

2. Verify all Section IDs exist in SECTIONS table:
   ```sql
   SELECT SECTION_ID FROM SECTIONS;
   ```

3. Verify all Professor IDs exist in USERS table (and have ROLE='Faculty'):
   ```sql
   SELECT USER_ID FROM USERS WHERE ROLE='Faculty';
   ```

4. Verify all Room IDs exist in ROOMS table:
   ```sql
   SELECT ROOM_ID FROM ROOMS;
   ```

### "Vite chunk size warning"

**Not an Error:** Frontend bundle ~600+ kB is normal for multi-role SPA

**If Needed to Reduce:**
1. Lazy-load portals using React `lazy()` & `Suspense`
2. Code-split by portal (router-based)
3. Tree-shake unused dependencies

---

## Development

### Project Structure for Developers

**Frontend** (React + Vite):
- Pages: `portals/{Faculty,Guard,Registrar,Principal,SystemAdmin}/`
- Reusable components: `components/`
- Routing logic: `App.jsx`
- API calls: Inline in components (centralize if expanded)

**Backend** (.NET Core):
- Controllers handle HTTP requests & validation
- Repositories execute Oracle queries
- Models define data transfer objects
- Services contain business logic (AccessVerification, MQTT, Image Upload)
- DI container in `Program.cs` registers all services

**Database** (Oracle):
- Schema in `database/schema.sql`
- Run full script to reset database
- Modify schema → Update repository queries → Update frontend components

**Edge Node** (Python):
- `app.py`: Flask web server
- `vision.py`: Face/barcode detection logic
- `camera.py`: Webcam control
- `config.py`: Configuration constants

### Adding a New Feature

**Example: Add "Courses" management for Registrar**

1. **Database**: Already exists in schema (COURSES table)

2. **Repository**:
   ```csharp
   // Repositories/ICourseRepository.cs
   public interface ICourseRepository {
     Task<List<Course>> GetAllCoursesAsync();
     Task CreateCourseAsync(Course course);
     Task UpdateCourseAsync(string code, Course course);
     Task DeleteCourseAsync(string code);
   }
   
   // Repositories/CourseRepository.cs
   public class CourseRepository : ICourseRepository {
     // Implementation using OracleConnection
   }
   ```

3. **Controller**:
   ```csharp
   [ApiController]
   [Route("api/[controller]")]
   public class CoursesController : ControllerBase {
     private readonly ICourseRepository _repo;
     
     [HttpGet]
     public async Task<IActionResult> GetCourses() {
       var courses = await _repo.GetAllCoursesAsync();
       return Ok(courses);
     }
     // ... POST, PUT, DELETE
   }
   ```

4. **Frontend Component**:
   ```javascript
   export default function CourseDirectory() {
     const [courses, setCourses] = useState([]);
     
     useEffect(() => {
       fetch('http://localhost:5106/api/courses')
         .then(r => r.json())
         .then(setCourses);
     }, []);
     
     return (
       <table>
         {courses.map(c => <tr key={c.Course_Code}>...</tr>)}
       </table>
     );
   }
   ```

5. **Add to Registrar Portal**:
   ```javascript
   <Tab label="Courses"><CourseDirectory /></Tab>
   ```

### Build & Deployment Commands

**Frontend:**
```powershell
# Development
npm.cmd run dev

# Production build
npm.cmd run build    # Output: dist/

# Lint check
npm.cmd run lint
```

**Backend:**
```powershell
# Build
dotnet build campus-backend\campus-backend.csproj

# Run
dotnet run

# Publish for deployment
dotnet publish -c Release -o ./publish
```

**Edge Node:**
```powershell
# Install dependencies
pip install -r requirements.txt

# Run
python app.py

# Package for deployment
# Create requirements.txt from venv:
pip freeze > requirements.txt
```

---

## Deployment

### Production Deployment Checklist

#### Database
- ✅ Back up CAMPUS_ADMIN schema before deployment
- ✅ Run `database/schema.sql` on production Oracle instance
- ✅ Update connection string in backend `appsettings.Production.json`
- ✅ Test Oracle connectivity from backend server

#### Backend
- ✅ Build: `dotnet publish -c Release -o ./publish`
- ✅ Update `appsettings.Production.json` with production URLs & secrets
- ✅ Enable HTTPS in production (configure certificate)
- ✅ Set `ASPNETCORE_ENVIRONMENT=Production`
- ✅ Deploy to web server (IIS, Azure App Service, Linux with systemd, etc.)
- ✅ Monitor `/ReferenceFaces/` directory disk space

#### Frontend
- ✅ Build: `npm.cmd run build`
- ✅ Update API base URL to production backend
- ✅ Deploy `dist/` folder to static hosting (CDN, web server, etc.)
- ✅ Configure CORS headers for production domain

#### Edge Node
- ✅ Create `.env` with MQTT broker credentials
- ✅ Set up auto-start service (systemd on Linux, Task Scheduler on Windows)
- ✅ Monitor camera & MQTT connectivity
- ✅ Log edge node errors to file for debugging

#### Monitoring
- ✅ Backend: Application Insights or Serilog
- ✅ Frontend: Error tracking (Sentry, etc.)
- ✅ Database: Oracle Enterprise Manager
- ✅ Edge Node: Log files + MQTT broker health checks

---

## Support & Documentation

- **Technical Deep-Dive:** See [CONTEXT.md](CONTEXT.md) for comprehensive architecture, API docs, database schema, code patterns
- **API Testing:** Use Postman or curl
- **Database Queries:** Use SQL*Plus or Oracle SQL Developer
- **Frontend Debugging:** Chrome DevTools (F12)
- **Backend Debugging:** Visual Studio or VS Code debugger

---

## Contributors

- **Lead:** EddyPotato
- **Architecture & Implementation:** Full-stack team

---

## License

[Specify your license here]

---

**Last Updated:** May 11, 2026  
**Comprehensive Documentation:** ✅ Available in CONTEXT.md  
**All Systems:** ✅ Tested and Operational
  

---

## Tech Stack

### Frontend
| Tool | Version |
|------|---------|
| React | 19.2.5 |
| Vite | 8.0.9 |
| Tailwind CSS | 4.2.4 |
| React Router | 7.14.2 |
| Lucide Icons | 1.8.0 |
| SignalR Client | 10.0.0 |

### Backend
| Tool | Version |
|------|---------|
| .NET | 10.0 |
| Oracle.ManagedDataAccess | 23.26.200 |
| BCrypt.Net-Next | 4.1.0 |
| MQTTnet | 4.3.7.1207 |
| SignalR | Built-in |

### Edge Node (Python)
| Library | Purpose |
|---------|---------|
| OpenCV 4.9.0+ | Video capture and processing |
| face_recognition 1.3.0+ | Facial recognition |
| pyzbar 0.1.9+ | Barcode/QR scanning |
| Flask 3.0.3+ | Web server for MJPEG stream |
| paho-mqtt 1.6.1+ | MQTT publish/subscribe |

### Database
- Oracle Database 21c XE (or compatible)
- Schema owner: `CAMPUS_ADMIN`
- 11 core tables + sequences

---

## Project Structure

```
AI-Assisted_Classroom_System/
├── README.md                          # This file
├── CONTEXT.md                         # Developer context & architecture
├── AI-Assisted_Classroom_System.sln   # Visual Studio solution
├─────────────────────────────────────
├── campus-backend/                    # ASP.NET Core REST API
│   ├── Controllers/                   # 12 API endpoints
│   ├── Hubs/                          # SignalR real-time hub
│   ├── Models/                        # Data transfer objects
│   ├── Repositories/                  # Oracle data access layer
│   ├── Services/                      # Business logic
│   ├── ReferenceFaces/                # Static face images
│   ├── Program.cs                     # Startup & DI
│   ├── appsettings.json               # Config
│   └── campus-backend.csproj
├─────────────────────────────────────
├── campus-dashboard/                  # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx                    # Main router
│   │   ├── components/
│   │   │   ├── auth/                  # Login
│   │   │   └── ui/                    # Header, Sidebar
│   │   └── portals/
│   │       ├── Faculty/               # Faculty portal & attendance
│   │       ├── Guard/                 # Real-time access monitoring
│   │       ├── Registrar/             # Admin tools (schedules, sections)
│   │       ├── Principal/             # Dashboard
│   │       └── SystemAdmin/           # System configuration
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├─────────────────────────────────────
├── campus-edge/                       # Python vision node
│   ├── app.py                         # Flask server
│   ├── vision.py                      # Face/barcode processing
│   ├── camera.py                      # Webcam control
│   ├── config.py                      # Configuration
│   ├── requirements.txt                # Python dependencies
│   └── .env                           # MQTT credentials (not in git)
├─────────────────────────────────────
├── database/
│   └── schema.sql                     # Oracle DDL + seed data
└── Services/                          # Shared services (if any)
```

---

## Getting Started

### Prerequisites

- **Backend**: Visual Studio 2022, .NET 10 SDK, NuGet
- **Frontend**: Node.js 18+, npm 8+
- **Database**: Oracle Database 21c XE, SQL*Plus (for schema import)
- **Edge**: Python 3.10+, pip
- **Camera**: Webcam or MJPEG source (optional, for Guard Portal)

### 1. Database Setup

```powershell
# Start Oracle XE (if not running)
# Then import the schema
sqlplus campus_admin/admin123@localhost:1521/XEPDB1 @database/schema.sql
```

Verify tables:
```sql
SELECT table_name FROM user_tables WHERE owner='CAMPUS_ADMIN';
```

### 2. Backend Setup

```powershell
cd campus-backend

# Restore dependencies
dotnet restore

# Build
dotnet build campus-backend.csproj

# Run
dotnet run
```

Backend available at: `http://localhost:5106`

SignalR hub: `ws://localhost:5106/campushub`

### 3. Frontend Setup

```powershell
cd campus-dashboard

# Install dependencies
npm install

# Start dev server
npm.cmd run dev
```

Frontend available at: `http://localhost:5173`

Login credentials (from seed data):
- **Registrar**: `registrar1` / `password`
- **Faculty**: `prof-001` / `password`
- **Guard**: `guard1` / `password`

### 4. Edge Node Setup (Optional, for Guard Portal)

```powershell
cd campus-edge

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run
python app.py
```

Edge node available at: `http://localhost:5000`

MJPEG stream: `http://localhost:5000/video_feed`

---

## API Documentation

All endpoints require a valid login session (sessionStorage).

### Authentication
```
POST   /api/auth/login
Body:  { "username": "user_id", "password": "password" }
Response: { "user": { "User_ID", "Role", "First_Name", "Last_Name", ... }, "message": "Login successful" }
```

### Registrar Workflows
```
GET    /api/sections
POST   /api/sections
PUT    /api/sections/{id}
DELETE /api/sections/{id}
GET    /api/sections/{id}/students
POST   /api/sections/{id}/students
DELETE /api/sections/{sectionId}/students/{studentId}

GET    /api/schedules
POST   /api/schedules
PUT    /api/schedules/{id}
DELETE /api/schedules/{id}
POST   /api/schedules/bulk-import   (CSV import)

GET    /api/courses
GET    /api/subjects
GET    /api/student
GET    /api/staff
```

### Guard Portal
```
GET    /api/camera/locations
POST   /api/camera/start
POST   /api/camera/stop
POST   /api/camera/verify

WebSocket /campushub
  ReceiveBarcode(data)
  ReceiveScanResult(data)
```

### Faculty & Attendance
```
GET    /api/attendance
GET    /api/enrollments
```

---

## Verification Commands

### Frontend
```powershell
cd campus-dashboard
npm.cmd run lint     # ESLint check
npm.cmd run build    # Vite production build
```

### Backend
```powershell
cd campus-backend
dotnet build campus-backend.csproj
```

Expected results:
- ✅ Frontend lint passes with no errors
- ✅ Frontend build completes (may show Vite chunk-size warning)
- ✅ Backend build succeeds

---

## Current Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Role-based auth | ✅ Done | 5 roles; sessionStorage (known localStorage issue in GuardPortal) |
| Faculty portal | ✅ Done | Dashboard, class attendance |
| Registrar portal | ✅ Done | Section CRUD, schedule import, directories |
| Guard portal | ✅ In progress | Camera control, barcode/face verification working |
| Principal portal | 🔶 Partial | Structure in place, workflows TBD |
| SystemAdmin portal | 🔶 Partial | Structure in place, configuration TBD |
| Section management | ✅ Done | Table-based directory, roster support |
| Schedule management | ✅ Done | CRUD + bulk import from CSV |
| Face verification | ✅ Done | Python edge node + backend integration |
| Barcode scanning | ✅ Done | QR code support via pyzbar |
| Real-time updates | ✅ Done | SignalR WebSocket |
| Event logging | ✅ Done | Attendance & access events in database |
| Image upload | ✅ Done | Reference face storage |

---

## Known Issues

1. **sessionStorage/localStorage mismatch**: GuardPortal.jsx reads from `localStorage` while Login.jsx uses `sessionStorage`. This causes Guard Portal to lose context. **Action**: Update GuardPortal line 11 to use `sessionStorage`.

2. **EVENT_LOGS.STATUS inconsistency**: Seed data mixes values (`'approved'`, `'denied'`, `'Access Granted'`). Should define enum and normalize.

3. **Bundle size warning**: Frontend production bundle (~600+ kB) triggers Vite's chunk-size warning. This is normal and non-blocking.

4. **SECTIONS has no STATUS column**: Archive/restore UI cannot be implemented until schema is updated.

5. **Bulk schedule import**: Does not yet detect or warn about schedule conflicts.

---

## Development Workflow

### Making Changes

1. **Backend**: Edit `.cs` files, rebuild, run tests
2. **Frontend**: Edit `.jsx` files; Vite hot-reload works in dev mode
3. **Database**: Changes must go through `database/schema.sql` and be manually applied
4. **Edge node**: Restart Python process if code changes

### Testing

1. **Login**: Test with different roles in separate browser tabs
2. **Registrar**: Test section CRUD, schedule import from CSV
3. **Guard**: Test camera control, barcode scanning, face verification (requires running edge node)
4. **Faculty**: Test class attendance tracking

### Debugging

- **Frontend**: Chrome DevTools (F12)
- **Backend**: Visual Studio debugger or console logs
- **MQTT**: Use MQTT client like MQTT.fx to monitor topics
- **Oracle**: Use SQL*Plus or Oracle SQL Developer

---

## Deployment Notes

### Database
- Backup `CAMPUS_ADMIN` schema before deploying changes
- Use `database/schema.sql` as source of truth
- Test schema changes on a dev instance first

### Backend
- Set `ASPNETCORE_ENVIRONMENT=Production` in release
- Update `appsettings.json` with production Oracle connection
- Enable HTTPS in production
- Monitor `ReferenceFaces/` directory size

### Frontend
- Run `npm.cmd run build` and serve static files from `dist/`
- Configure CORS for production domain in backend
- Consider CDN for image assets

### Edge Node
- Use systemd service file or Windows Task Scheduler for auto-start
- Monitor camera and MQTT connectivity
- Log edge node errors to a file for debugging

---

## Support & Documentation

- **Architecture & Context**: See [CONTEXT.md](CONTEXT.md)
- **Guard Portal Guide**: See `GUARD_PORTAL_DEV_GUIDE.md` (if available)
- **Development Roadmap**: See `NEXT_GOALS.md` (if available)
- **Database Schema**: See `database/schema.sql`

---

## Authors & Attribution

- **Lead**: EddyPotato
- **Tech Stack**: React, ASP.NET Core, Oracle, Python, OpenCV
- **License**: (Specify your license here)

---

## Quick Troubleshooting

### "Cannot find campus_user in sessionStorage"
→ You need to log in first. Go to `http://localhost:5173/login`

### "Port 5106 already in use"
```powershell
netstat -ano | findstr :5106
taskkill /PID <PID> /F
```

### "Oracle connection failed"
Check `appsettings.json` has `OracleConnection` and Oracle XE is running

### "npm.cmd: execution policy" error
Use `npm.cmd run dev` (with .cmd) instead of `npm run dev`

### "Python edge node not responding"
```powershell
curl http://localhost:5000
python -m pip install -r campus-edge/requirements.txt
```

---

**Last Updated:** May 8, 2026  
**Repository**: [GitHub](https://github.com/EddyPotato/AI-Assisted_Classroom_System)
ENROLLMENTS.STUDENT_ID
ENROLLMENTS.SECTION_ID
ENROLLMENTS.ENROLLMENT_DATE
```

---

## Setup

### 1. Database

Run `database/schema.sql` in Oracle SQL Developer or SQL*Plus.

The backend expects this connection string in `campus-backend/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "OracleConnection": "Data Source=localhost:1521/XEPDB1;User Id=campus_admin;Password=admin123;"
  }
}
```

### 2. Backend

```powershell
cd campus-backend
dotnet restore
dotnet build
dotnet run
```

Backend URL:

```text
http://localhost:5106
```

### 3. Frontend

Use `npm.cmd` on Windows PowerShell if `npm.ps1` is blocked by execution policy.

```powershell
cd campus-dashboard
npm install
npm.cmd run dev
```

Frontend URL:

```text
http://localhost:5173
```

### 4. Edge Node

```powershell
cd campus-edge
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python vision_node.py
```

Edge node URL:

```text
http://localhost:5000
```

Video feed:

```text
http://localhost:5000/video_feed
```

---

## Main API Endpoints

### Schedules

```text
GET    /api/schedules
POST   /api/schedules
PUT    /api/schedules/{id}
DELETE /api/schedules/{id}
POST   /api/schedules/bulk-import
```

Bulk import expects rows shaped like:

```text
Subject_Code,Section_Id,Professor_Id,Room_Id,Time_Start,Time_End,Class_Days,Subject_Type
SE101,SEC-001,PRO-0001,IK604,02:30 PM,05:30 PM,Thursday/Thu,Lec
```

### Sections

```text
GET    /api/sections
POST   /api/sections
PUT    /api/sections/{id}
DELETE /api/sections/{id}
GET    /api/sections/{id}/students
POST   /api/sections/{id}/students
DELETE /api/sections/{sectionId}/students/{studentId}
GET    /api/sections/{id}/schedule
```

### Other Registrar Data

```text
GET /api/student
GET /api/staff
GET /api/subjects
GET /api/courses
GET /api/rooms
```

### Guard and Camera

```text
GET  /api/camera/locations
POST /api/camera/locations
PUT  /api/camera/location/{id}
POST /api/camera/start
POST /api/camera/stop
POST /api/camera/manual-scan
```

SignalR hub:

```text
http://localhost:5106/campushub
```

Static face photos:

```text
http://localhost:5106/ReferenceFaces/{filename}
```

---

## Running the Full System

Open three terminals:

```powershell
cd campus-backend
dotnet run
```

```powershell
cd campus-dashboard
npm.cmd run dev
```

```powershell
cd campus-edge
venv\Scripts\activate
python vision_node.py
```

Then open:

```text
http://localhost:5173
```

---

## Troubleshooting

### Port 5106 is already in use

```powershell
Get-NetTCPConnection -LocalPort 5106 -ErrorAction SilentlyContinue
Get-Process campus-backend -ErrorAction SilentlyContinue
Stop-Process -Id <PID>
```

Only stop the specific `campus-backend` process holding port `5106`.

### `npm` is blocked in PowerShell

Use:

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
```

### Schedules do not create/edit/delete

Confirm `SchedulesController.cs` still exposes:

```text
POST /api/schedules
PUT /api/schedules/{id}
DELETE /api/schedules/{id}
```

The roster schedule form depends on those endpoints.

### Section edit shows wrong campus or letter

Confirm `GET /api/sections` includes:

```text
campus
section_Letter
```

These come from `SectionRepository.GetAllSectionsAsync()`.

---

## Git Ignore Notes

Do not commit generated or sensitive files:

- `node_modules/`
- `dist/`
- `bin/`
- `obj/`
- `.env`
- `venv/`
- `.venv/`
- `ReferenceFaces/`
- real student/staff face photos
- media files such as `.jpg`, `.jpeg`, `.png`, `.mp4`

---

## Recommended Next Work

1. Test the full Registrar schedule flow in the browser: import, global directory, section roster schedule add/edit/delete.
2. Test section creation/editing against Oracle records that use different campuses and letters.
3. Add stronger API validation around duplicate schedule IDs and invalid foreign keys.
4. Normalize `EVENT_LOGS.STATUS` values later; seed data currently mixes values such as `approved`, `denied`, and `Access Granted`.
5. Consider adding `SECTIONS.STATUS` only if archive/restore is truly needed, then wire UI and repository logic after the schema change.

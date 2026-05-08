# AI-Assisted Smart Campus & Classroom System

Comprehensive smart campus platform for registrar workflows, section management, scheduling, classroom attendance, and guard access monitoring with real-time face verification and barcode scanning.

**Status:** May 8, 2026 | Passing lint & build | Multi-role portal system (Faculty, Guard, Registrar, Principal, SystemAdmin)

---

## Overview

A modern, integrated campus management system built with:

- **Frontend**: React 19.2.5 + Vite 8.0.9 + Tailwind CSS
- **Backend**: ASP.NET Core (net10.0) + Oracle Database + SignalR
- **Real-time**: WebSocket-based live updates and notifications
- **Vision**: Python 3.10+ edge node for camera processing, barcode scanning, and face verification
- **Communication**: MQTT for device-to-backend messaging

### Key Features

✅ **Multi-role authentication** — Faculty, Guard, Registrar, Principal, SystemAdmin  
✅ **Registrar management** — Student/staff directories, section rosters, schedule import  
✅ **Faculty dashboard** — Class attendance tracking and roster management  
✅ **Guard portal** — Real-time barcode scanning, face verification, access logs  
✅ **Schedule management** — Master schedule import, CRUD operations, subject type support  
✅ **Student enrollment** — Section-based enrollment, attendance tracking  
✅ **Face verification** — OpenCV + face_recognition integration  
✅ **Real-time updates** — SignalR WebSocket for instant notifications  
✅ **Camera system** — Multi-camera support with location-based logic  
✅ **Oracle persistence** — Centralized data with schema validation  

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

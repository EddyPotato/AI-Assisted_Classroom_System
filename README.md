# AI-Assisted Smart Campus & Classroom System

Smart campus platform for registrar workflows, section rosters, master schedules, classroom attendance, and guard access monitoring. The system uses a React dashboard, ASP.NET Core API, Oracle Database, SignalR, MQTT, and a Python camera edge node.

**Current date/state:** May 7, 2026
**Current progress:** Registrar schedule/import work is integrated, the Section Directory now uses an Excel-style table view, and schema-sensitive section/schedule logic has been corrected without changing the database structure.

---

## What Works Now

- Role-based dashboard portals:
  - Registrar
  - Faculty
  - Guard
  - Principal
- Registrar directories:
  - Student Directory
  - Staff Directory
  - Section Directory
  - Schedule Directory
  - Resource Directory for subjects and courses
- Section workflows:
  - Create, edit, delete sections
  - View sections in a sortable table
  - Open section roster from the table
  - Add/remove students from a section roster
  - Assign, edit, and delete section schedules
- Schedule workflows:
  - Global schedule directory
  - Schedule CRUD endpoints
  - Master Schedule Import tab for CSV/Excel-style pasted schedule rows
  - Subject type support through `SUBJECT_TYPE` (`Lec` / `Lab`)
- Guard and camera workflows:
  - Camera location support
  - Start/stop camera through backend proxy
  - Manual scan and bypass paths
  - SignalR updates from backend to dashboard
- Python edge node:
  - Webcam/MJPEG feed
  - Barcode/QR detection
  - Face verification
  - MQTT publishing

---

## Latest Fixes

- Changed the Registrar Section Directory from card layout to a sortable table layout.
- Removed unsupported section archive/status UI logic because `SECTIONS` in `database/schema.sql` has no `STATUS` column.
- Restored schedule CRUD endpoints in `SchedulesController.cs` while keeping the new `POST /api/schedules/bulk-import` endpoint.
- Fixed section edit fidelity by returning `CAMPUS` and `SECTION_LETTER` from `SectionRepository.GetAllSectionsAsync()`.
- Reconnected global Schedule Directory to `useGlobalScheduleLogic.js` so it uses the shared schedule shape from `ScheduleRepository`.
- Fixed time sorting in global schedules to compare schedule times numerically.
- Kept schema naming aligned with the current Oracle export.

---

## Verification

Passed:

```powershell
cd campus-dashboard
npm.cmd run lint
npm.cmd run build
```

```powershell
cd ..
dotnet build campus-backend\campus-backend.csproj
```

Note: `npm.cmd run build` completes with Vite's normal large-chunk warning because the app bundle is over 500 kB after minification.

---

## Tech Stack

### Frontend

- React `19.2.5`
- Vite `8.0.9`
- Tailwind CSS `4.2.4`
- React Router `7.14.2`
- Lucide React `1.8.0`
- Microsoft SignalR client `10.0.0`

### Backend

- ASP.NET Core targeting `net10.0`
- Oracle.ManagedDataAccess.Core `23.26.200`
- BCrypt.Net-Next `4.1.0`
- MQTTnet `4.3.7.1207`
- SignalR

### Edge Node

- Python 3.10+
- OpenCV
- pyzbar
- face_recognition
- Flask
- paho-mqtt

### Database

- Oracle Database 21c XE
- Schema owner: `CAMPUS_ADMIN`
- Main schema file: `database/schema.sql`

---

## Project Structure

```text
AI-Assisted_Classroom_System/
  README.md
  CONTEXT.md
  AI-Assisted_Classroom_System.sln
  database/
    schema.sql
  campus-backend/
    Controllers/
    Hubs/
    Models/
    Repositories/
    Services/
    Program.cs
    appsettings.json
    campus-backend.csproj
  campus-dashboard/
    src/
      components/
      portals/
        Faculty/
        Guard/
        Principal/
        Registrar/
    package.json
    vite.config.js
  campus-edge/
    vision_node.py
    requirements.txt
```

---

## Important Schema Notes

Use `database/schema.sql` as the naming source of truth.

Current core Oracle tables:

- `USERS`
- `STUDENTS`
- `CAMPUSES`
- `COURSES`
- `SUBJECTS`
- `ROOMS`
- `SECTIONS`
- `ENROLLMENTS`
- `SCHEDULES`
- `EVENT_LOGS`
- `CAMERA_LOCATIONS`

Important section columns:

```text
SECTIONS.SECTION_ID
SECTIONS.CAMPUS
SECTIONS.COURSE
SECTIONS.YEAR_LEVEL
SECTIONS.SECTION_LETTER
SECTIONS.SECTION_NAME
```

There is currently no `SECTIONS.STATUS` column. Do not add frontend archive/restore logic unless the schema is intentionally changed first.

Important schedule columns:

```text
SCHEDULES.SCHEDULE_ID
SCHEDULES.SUBJECT_CODE
SCHEDULES.SECTION_ID
SCHEDULES.PROFESSOR_ID
SCHEDULES.ROOM_ID
SCHEDULES.TIME_START
SCHEDULES.TIME_END
SCHEDULES.CLASS_DAYS
SCHEDULES.SUBJECT_TYPE
```

Important enrollment columns:

```text
ENROLLMENTS.ENROLLMENT_ID
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

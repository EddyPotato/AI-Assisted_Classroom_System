# AI-Assisted Smart Campus & Classroom System - Project Context

**Last updated:** May 7, 2026
**Current status:** Registrar schedule/import work is integrated, Section Directory is now table-based, and backend/frontend verification passes.
**Team lead:** EddyPotato

This file is the working memory for the project. Read it before changing code, especially when touching schema-sensitive registrar logic.

---

## Project Overview

The system is an integrated smart campus platform for:

- Student and staff identity records
- Registrar section, roster, schedule, course, subject, room, and staff workflows
- Guard Portal access monitoring with barcode/QR scan and face verification
- Real-time dashboard updates through SignalR
- Python edge-node camera processing through OpenCV, pyzbar, face_recognition, Flask, and MQTT
- Oracle Database persistence

Repo areas:

- `campus-dashboard/` - React/Vite frontend
- `campus-backend/` - ASP.NET Core API, SignalR hub, MQTT listener, Oracle repositories
- `campus-edge/` - Python camera/vision node
- `database/` - Oracle schema and seed data

---

## Latest Work Completed

### Registrar Section Directory

The Section Directory was changed from cards to a table view so it feels closer to Excel and the other registrar directories.

Changed files:

- `campus-dashboard/src/portals/Registrar/components/sections/SectionsTab.jsx`
- `campus-dashboard/src/portals/Registrar/components/sections/hooks/useSectionsLogic.js`
- `campus-dashboard/src/portals/Registrar/components/sections/SectionForm.jsx`
- `campus-dashboard/src/portals/Registrar/components/sections/hooks/useSectionFormLogic.js`
- `campus-backend/Repositories/SectionRepository.cs`

Important behavior:

- Table columns include section, campus, program, year, student count, primary adviser, primary subject, and actions.
- Rows open the section roster.
- Actions allow opening roster, editing, and deleting.
- Sorting is local to the table.
- Filtering by search, program, and year is preserved.
- Unsupported archive/restore UI was removed because the current schema has no `SECTIONS.STATUS` column.
- `GetAllSectionsAsync()` now returns `CAMPUS` and `SECTION_LETTER`, preventing section edits from falling back to default values.

### Registrar Schedules

Schedule controller logic was corrected so the new bulk importer does not break the existing schedule form.

Changed files:

- `campus-backend/Controllers/SchedulesController.cs`
- `campus-dashboard/src/portals/Registrar/components/schedules/SchedulesTab.jsx`
- `campus-dashboard/src/portals/Registrar/components/schedules/hooks/useGlobalScheduleLogic.js`

Important behavior:

- `GET /api/schedules` uses `ScheduleRepository.GetAllSchedulesAsync()`.
- Existing CRUD endpoints are restored:
  - `POST /api/schedules`
  - `PUT /api/schedules/{id}`
  - `DELETE /api/schedules/{id}`
- New bulk import endpoint remains:
  - `POST /api/schedules/bulk-import`
- Bulk import validates required fields before inserting.
- Bulk import uses nullable Oracle values for optional professor and room IDs.
- Global schedule directory uses the shared hook again and sorts times numerically.

### Master Schedule Import

Current file:

- `campus-dashboard/src/portals/Registrar/views/ScheduleImporter.jsx`

Expected CSV headers:

```text
Subject_Code,Section_Id,Professor_Id,Room_Id,Time_Start,Time_End,Class_Days,Subject_Type
```

Example:

```text
SE101,SEC-001,PRO-0001,IK604,02:30 PM,05:30 PM,Thursday/Thu,Lec
```

The importer posts parsed rows to:

```text
POST /api/schedules/bulk-import
```

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
```

Notes:

- `npm.cmd run build` finishes successfully with Vite's large-chunk warning.
- A previous backend build failed only because a running `campus-backend` process locked the output DLL/EXE. After stopping the process, normal `dotnet build` passed.

---

## Architecture

### Frontend

Stack:

- React `19.2.5`
- Vite `8.0.9`
- Tailwind CSS `4.2.4`
- React Router `7.14.2`
- Lucide React `1.8.0`
- Microsoft SignalR client `10.0.0`

Default URL:

```text
http://localhost:5173
```

Important paths:

```text
campus-dashboard/src/
  App.jsx
  main.jsx
  components/
    auth/
    ui/
  portals/
    Faculty/
    Guard/
    Principal/
    Registrar/
      RegistrarPortal.jsx
      views/ScheduleImporter.jsx
      components/
        schedules/
        sections/
        users/
        faculty/
        resources/
```

### Backend

Stack:

- ASP.NET Core targeting `net10.0`
- Oracle.ManagedDataAccess.Core `23.26.200`
- BCrypt.Net-Next `4.1.0`
- MQTTnet `4.3.7.1207`
- SignalR

Default URL:

```text
http://localhost:5106
```

Important paths:

```text
campus-backend/
  Controllers/
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
  Hubs/CampusHub.cs
  Models/
  Repositories/
  Services/
    AccessVerificationService.cs
    MqttListenerService.cs
  Program.cs
```

SignalR hub:

```text
http://localhost:5106/campushub
```

Static face-photo route:

```text
http://localhost:5106/ReferenceFaces/{filename}
```

### Edge Node

Path:

```text
campus-edge/vision_node.py
```

Default URLs:

```text
http://localhost:5000
http://localhost:5000/video_feed
```

Responsibilities:

- Wake the webcam when requested
- Serve the MJPEG feed
- Read barcode/QR codes
- Compare faces against reference images
- Publish MQTT events to the backend

---

## Database Context

Use `database/schema.sql` as the source of truth. Do not infer new column names from UI ideas.

Schema owner:

```text
CAMPUS_ADMIN
```

Connection string key currently used:

```json
{
  "ConnectionStrings": {
    "OracleConnection": "Data Source=localhost:1521/XEPDB1;User Id=campus_admin;Password=admin123;"
  }
}
```

Backend code that accepts multiple local config styles should use this fallback:

```csharp
configuration.GetConnectionString("DefaultConnection")
    ?? configuration.GetConnectionString("OracleConnection")
    ?? configuration.GetConnectionString("OracleDb")
    ?? throw new InvalidOperationException("Connection string not found.");
```

### Core Tables

```text
CAMERA_LOCATIONS
CAMPUSES
COURSES
ENROLLMENTS
EVENT_LOGS
ROOMS
SCHEDULES
SECTIONS
STUDENTS
SUBJECTS
USERS
```

### Section Naming

Current section columns:

```text
SECTION_ID
CAMPUS
COURSE
YEAR_LEVEL
SECTION_LETTER
SECTION_NAME
```

Important:

- There is no `STATUS` column on `SECTIONS`.
- There is no section archive table.
- `SECTIONS.CAMPUS` references `CAMPUSES.CAMPUS_CODE`.
- `SECTIONS.SECTION_NAME` is unique.
- `SECTIONS.COURSE` is currently a short registrar code in existing seed data, such as `IT`.

Do not write code that depends on:

```text
SECTIONS.STATUS
SECTIONS.COURSE_CODE
SECTIONS.PROGRAM
```

unless the schema is intentionally changed first.

### Schedule Naming

Current schedule columns:

```text
SCHEDULE_ID
SUBJECT_CODE
SECTION_ID
PROFESSOR_ID
ROOM_ID
TIME_START
TIME_END
CLASS_DAYS
SUBJECT_TYPE
```

Foreign keys:

- `SCHEDULES.SUBJECT_CODE` -> `SUBJECTS.SUBJECT_CODE`
- `SCHEDULES.SECTION_ID` -> `SECTIONS.SECTION_ID`
- `SCHEDULES.PROFESSOR_ID` -> `USERS.USER_ID`
- `SCHEDULES.ROOM_ID` -> `ROOMS.ROOM_ID`

`SUBJECT_TYPE` defaults to `Lec`.

### Enrollment Naming

Current enrollment columns:

```text
ENROLLMENT_ID
STUDENT_ID
SECTION_ID
ENROLLMENT_DATE
```

Foreign keys:

- `ENROLLMENTS.STUDENT_ID` -> `STUDENTS.STUDENT_ID`
- `ENROLLMENTS.SECTION_ID` -> `SECTIONS.SECTION_ID`

---

## Registrar Portal Notes

Current tabs in `RegistrarPortal.jsx`:

- Schedule Directory
- Master Import
- Resource Directory
- Section Directory
- Student Directory
- Staff Directory

The `Master Import` tab imports from:

```text
campus-dashboard/src/portals/Registrar/views/ScheduleImporter.jsx
```

The section roster view still depends on schedule CRUD endpoints. Do not remove these from `SchedulesController.cs`:

```text
POST /api/schedules
PUT /api/schedules/{id}
DELETE /api/schedules/{id}
```

The table-based Section Directory should stay schema-honest. Archive/restore can return later only after adding and documenting a real section status column.

---

## Guard Portal Notes

Guard Portal Phase 2 has these pieces:

- Camera location selector
- Start/Stop camera controls
- Manual ID input fallback
- Manual bypass modal
- Live monitor and access history views
- Location-aware camera/event support

Important tables/columns:

```text
CAMERA_LOCATIONS.LOCATION_ID
CAMERA_LOCATIONS.CAMERA_NAME
CAMERA_LOCATIONS.LOCATION_TYPE
CAMERA_LOCATIONS.ASSOCIATED_ROOM_ID
CAMERA_LOCATIONS.STATUS_ON_SCAN
CAMERA_LOCATIONS.IS_ACTIVE
CAMERA_LOCATIONS.LOGIC_TYPE
EVENT_LOGS.LOCATION_ID
EVENT_LOGS.BYPASS_REASON
```

MQTT topics:

```text
campus/door/scan
campus/door/verified
```

Known data issue:

- `EVENT_LOGS.STATUS` seed values are mixed (`approved`, `denied`, `Access Granted`). Normalize later when reporting logic depends on it.

---

## Running Locally

Backend:

```powershell
cd campus-backend
dotnet run
```

Frontend:

```powershell
cd campus-dashboard
npm.cmd run dev
```

Edge node:

```powershell
cd campus-edge
venv\Scripts\activate
python vision_node.py
```

Open:

```text
http://localhost:5173
```

---

## Troubleshooting

### Backend build cannot copy DLL/EXE

Usually a backend process is still running and locking files.

```powershell
Get-Process campus-backend -ErrorAction SilentlyContinue
Stop-Process -Id <PID>
dotnet build campus-backend\campus-backend.csproj
```

### Port 5106 is already in use

```powershell
Get-NetTCPConnection -LocalPort 5106 -ErrorAction SilentlyContinue
Get-Process campus-backend -ErrorAction SilentlyContinue
```

### PowerShell blocks npm

Use:

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
```

### Camera start fails

Make sure the Python edge node is running on port `5000`.

### Oracle errors

Check:

- Oracle XE is running
- `campus-backend/appsettings.json` has `OracleConnection`
- Code does not request only `DefaultConnection` without fallback

---

## Current Known Issues

- `database/schema.sql` includes seed/event data, not only pure DDL.
- `EVENT_LOGS.STATUS` values should be normalized later.
- Bulk schedule import does not yet do conflict detection.
- Bulk schedule import depends on valid foreign keys already existing in Oracle.
- The frontend production bundle is currently large enough to trigger Vite's chunk-size warning.
- Some generated comments in older code use "THE FIX" language; not harmful, but future cleanup can make comments calmer.

---

## Next Best Tasks

1. Browser-test Registrar schedule import from pasted CSV rows.
2. Browser-test section table sorting, filtering, edit, delete, and roster open.
3. Test section schedule add/edit/delete after the CRUD endpoint restoration.
4. Add conflict detection for imported schedules.
5. Decide whether section archive/restore is really needed; if yes, add `SECTIONS.STATUS` intentionally in schema first.
6. Continue full Guard Portal testing with Oracle, MQTT, backend, frontend, and edge node running together.

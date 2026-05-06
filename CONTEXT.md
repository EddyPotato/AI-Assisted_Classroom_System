# AI-Assisted Smart Campus & Classroom System - Project Context

**Last updated:** May 6, 2026  
**Current status:** Guard Portal Phase 2 integration in progress; backend and frontend build clean after today's fixes.  
**Team lead:** EddyPotato

This file is the working memory for the project. Read this before changing code so the current architecture, completed work, and active problems are clear.

---

## Project Overview

The system is an integrated smart campus platform for:

- Student and staff identity management
- Registrar section, enrollment, schedule, course, room, and staff workflows
- Guard Portal access control using barcode/QR scan plus face verification
- Real-time updates through SignalR
- Python edge-node camera processing through OpenCV, pyzbar, face_recognition, Flask, and MQTT
- Oracle Database persistence

The repo has four main parts:

- `campus-dashboard/` - React/Vite frontend
- `campus-backend/` - ASP.NET Core API, SignalR hub, MQTT listener, Oracle repositories
- `campus-edge/` - Python camera/vision node
- `database/` - Oracle schema and seed data

---

## Current State After Today's Fixes

### What was fixed right now

The app had two immediate problems:

1. **Frontend lint/build issue in Guard Portal camera feed**
   - File: `campus-dashboard/src/portals/Guard/components/LiveCameraFeed.jsx`
   - Problem: `setState` was called directly inside `useEffect`, which failed React's newer ESLint rules.
   - Fix: `LiveCameraFeed` is now presentational. The stream cache token is owned by `GuardPortal.jsx` and updated when the camera successfully starts.
   - Related file: `campus-dashboard/src/portals/Guard/GuardPortal.jsx`

2. **Backend camera API returned HTTP 500 / ORA-50029**
   - Files:
     - `campus-backend/Controllers/CameraController.cs`
     - `campus-backend/Repositories/CameraLocationRepository.cs`
     - `campus-backend/Services/AccessVerificationService.cs`
   - Problem: Phase 2 camera/access code requested `DefaultConnection`, but `appsettings.json` defines `OracleConnection`.
   - Fix: These classes now use the same fallback pattern as the other repositories:
     - `DefaultConnection`
     - `OracleConnection`
     - `OracleDb`
     - throw a clear exception if none exists

### Verification completed today

These checks passed after the fixes:

```powershell
cd campus-dashboard
npm.cmd run lint
npm.cmd run build

cd ../campus-backend
dotnet build
```

Runtime checks also passed:

- Frontend responded with HTTP `200` at `http://127.0.0.1:5173`
- Backend camera locations endpoint responded with HTTP `200` at `http://localhost:5106/api/camera/locations`

### Important runtime note

A backend instance was started in the background during verification. It caused this error when another `dotnet run` was started:

```text
Failed to bind to address http://127.0.0.1:5106: address already in use
```

The lingering `campus-backend.exe` process was stopped. If this happens again:

```powershell
Get-NetTCPConnection -LocalPort 5106 -ErrorAction SilentlyContinue
Get-Process campus-backend -ErrorAction SilentlyContinue
Stop-Process -Id <PID>
```

Only stop the specific `campus-backend` process that is holding port `5106`.

---

## Architecture

### Frontend: `campus-dashboard/`

- React `19.2.5`
- Vite `8.0.9`
- Tailwind CSS `4.2.4`
- React Router `7.14.2`
- Lucide React `1.8.0`
- Microsoft SignalR client `10.0.0`
- Default dev URL: `http://localhost:5173`

Important frontend paths:

```text
src/
  App.jsx
  main.jsx
  components/
    auth/
    ui/
  portals/
    Faculty/
    Guard/
      GuardPortal.jsx
      components/
        AccessHistory.jsx
        AccessLogEntry.jsx
        BypassModal.jsx
        CameraControls.jsx
        LiveCameraFeed.jsx
        ManualIDInput.jsx
        VerificationPanel.jsx
    Principal/
    Registrar/
```

### Backend: `campus-backend/`

- ASP.NET Core targeting `net10.0`
- Oracle.ManagedDataAccess.Core `23.26.200`
- BCrypt.Net-Next `4.1.0`
- MQTTnet `4.3.7.1207`
- SignalR hub at `/campushub`
- Default API URL: `http://localhost:5106`
- Static face-photo route: `http://localhost:5106/ReferenceFaces/{filename}`

Important backend paths:

```text
Controllers/
  AuthController.cs
  CameraController.cs
  EnrollmentsController.cs
  RoomsController.cs
  SchedulesController.cs
  SectionsController.cs
  StaffController.cs
  StudentController.cs
  UserController.cs
Hubs/
  CampusHub.cs
Repositories/
  CameraLocationRepository.cs
  CourseRepository.cs
  EnrollmentRepository.cs
  RoomRepository.cs
  ScheduleRepository.cs
  SectionRepository.cs
  StaffRepository.cs
  StudentRepository.cs
  SubjectRepository.cs
  UserRepository.cs
Services/
  AccessVerificationService.cs
  MqttListenerService.cs
```

### Edge Node: `campus-edge/`

- Python 3.10+
- OpenCV
- pyzbar
- face_recognition
- Flask
- paho-mqtt
- Video feed: `http://localhost:5000/video_feed`
- Camera control endpoints:
  - `POST http://localhost:5000/start_camera`
  - `POST http://localhost:5000/stop_camera`

`vision_node.py` keeps the webcam asleep until the Guard Portal asks the backend to start it. The backend proxies camera start/stop calls to the Python node.

### Database: `database/`

- Oracle Database 21c XE
- Schema owner: `CAMPUS_ADMIN`
- Connection string key currently used by the app: `OracleConnection`
- Main schema file: `database/schema.sql`

Current important tables:

- `USERS`
- `STUDENTS`
- `STAFF`
- `SECTIONS`
- `ENROLLMENTS`
- `SCHEDULES`
- `ROOMS`
- `COURSES`
- `SUBJECTS`
- `EVENT_LOGS`
- `CAMERA_LOCATIONS`

`CAMERA_LOCATIONS` currently supports examples like:

- `CAM-001` - Main Entrance Gate
- `CAM-002` - Main Exit Gate
- `CAM-IL604` - IL604 Classroom

`EVENT_LOGS` now includes location-aware and bypass-aware fields:

- `LOCATION_ID`
- `BYPASS_REASON`

---

## Completed Work

### Registrar and academic management

Completed:

- Student directory and profile handling
- Staff directory with soft delete, restore, hard delete, and face-photo display
- Section CRUD:
  - `GET /api/sections`
  - `POST /api/sections`
  - `PUT /api/sections/{id}`
  - `DELETE /api/sections/{id}`
- Section roster student add/remove
- Section schedule display
- Professor assignment display with face photos
- Schedule table spacing and alignment improvements
- `SectionDTO` supports `Campus` and `Section_Letter`
- Course and subject repositories exist

Still planned:

- Complete polish for all schedule/room/subject CRUD workflows
- Refactor `SectionRoster.jsx` into smaller focused components
- Add stronger role-based access control
- Add batch import and reporting features

### Guard Portal Phase 1

Completed prototype behavior:

- Guard-specific portal route and layout
- Live MJPEG camera feed display
- Barcode/QR detection in Python edge node through pyzbar
- MQTT topics:
  - `campus/door/scan`
  - `campus/door/verified`
- Backend MQTT listener receives edge-node events
- SignalR broadcasts scan and verification updates to the React UI
- Recent access log display
- Profile picture/verification display

### Guard Portal Phase 2, now partially implemented

Implemented or wired:

- Camera location selector
- Start/Stop camera controls
- Manual ID entry fallback
- Manual bypass modal
- Separate live monitor and access history tabs
- Privacy-first recent log display limited to recent visible entries
- Backend camera location endpoints
- Backend manual scan endpoint
- Backend manual bypass logging path
- Location-aware event logging
- Database schema includes `CAMERA_LOCATIONS`, `LOCATION_ID`, and `BYPASS_REASON`
- Lockdown-style control has been removed from the current Guard Portal UI

Needs more testing:

- Full end-to-end barcode scan to face verification to SignalR display
- Manual ID entry with real database records
- Manual bypass logging with real database records
- Location-based status behavior for Entrance, Exit, and Room cameras
- Python edge-node stability over long sessions
- Consistent status strings in `EVENT_LOGS`

---

## Guard Portal Runtime Flow

### Normal scan

1. Guard opens the Guard Portal.
2. Guard selects a camera location.
3. Guard clicks Start Camera.
4. Frontend calls `POST /api/camera/start`.
5. Backend proxies to Python `POST /start_camera`.
6. Python starts camera capture and serves MJPEG at `/video_feed`.
7. Student shows barcode/QR code.
8. Python publishes MQTT message to `campus/door/scan`.
9. Backend reads student data and broadcasts `ReceiveBarcode`.
10. Python compares live face against reference face.
11. Python publishes result to `campus/door/verified`.
12. Backend logs approved access and broadcasts `ReceiveScanResult`.
13. Guard UI updates in real time.

### Manual ID fallback

1. Guard enters a student ID manually.
2. Frontend calls `POST /api/camera/manual-scan`.
3. Backend looks up the student.
4. Backend broadcasts `ReceiveBarcode`.
5. UI shows scanning/missing-face state.

### Manual bypass

1. Guard opens bypass modal.
2. Guard enters student ID and reason.
3. Frontend calls `POST /api/camera/manual-scan` with `Bypass_Reason`.
4. Backend logs directly to `EVENT_LOGS`.
5. Backend broadcasts `ReceiveScanResult`.

---

## Important URLs and Ports

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5106`
- SignalR hub: `http://localhost:5106/campushub`
- Python edge node: `http://localhost:5000`
- Python video feed: `http://localhost:5000/video_feed`
- Face photo static route: `http://localhost:5106/ReferenceFaces/{filename}`
- Oracle XE: `localhost:1521/XEPDB1`
- MQTT broker: `localhost`

---

## Connection Strings

Current `campus-backend/appsettings.json` uses:

```json
{
  "ConnectionStrings": {
    "OracleConnection": "Data Source=localhost:1521/XEPDB1;User Id=campus_admin;Password=admin123;"
  }
}
```

New or updated backend code should use the existing fallback pattern:

```csharp
configuration.GetConnectionString("DefaultConnection")
    ?? configuration.GetConnectionString("OracleConnection")
    ?? configuration.GetConnectionString("OracleDb")
    ?? throw new InvalidOperationException("Connection string not found.");
```

This avoids the `ORA-50029: OracleConnection.ConnectionString is invalid` issue.

---

## Running the Project

Use three terminals.

### Terminal 1: Backend

```powershell
cd campus-backend
dotnet run
```

Expected backend URL:

```text
http://localhost:5106
```

### Terminal 2: Frontend

On Windows PowerShell, prefer `npm.cmd` if script execution blocks `npm.ps1`.

```powershell
cd campus-dashboard
npm.cmd run dev
```

Expected frontend URL:

```text
http://localhost:5173
```

### Terminal 3: Edge Node

```powershell
cd campus-edge
venv\Scripts\activate
python vision_node.py
```

Expected edge-node URL:

```text
http://localhost:5000
```

---

## Current Known Issues and Notes

- Do not run two backend instances on port `5106`.
- If `npm` fails in PowerShell because scripts are disabled, use `npm.cmd`.
- Oracle must be running before calling backend endpoints that query the database.
- MQTT broker must be running for real camera scan events.
- The Python edge node path to `ReferenceFaces` is currently hardcoded in `vision_node.py`.
- `database/schema.sql` currently contains seed/event data; be careful before replacing it with a clean schema-only export.
- Some older docs had mojibake/encoding artifacts. This file has been rewritten in plain ASCII Markdown.

---

## Next Best Tasks

1. Test the full Guard Portal flow with Oracle, MQTT, backend, frontend, and Python edge node running together.
2. Confirm camera location selection is included in MQTT payloads from the edge node when needed.
3. Normalize event statuses in `EVENT_LOGS` (`approved`, `denied`, `Access Granted` are currently mixed).
4. Add safer API error handling for missing camera locations and database failures.
5. Refactor Guard Portal components only after the current flow is stable.
6. Refactor `SectionRoster.jsx` after Guard Portal Phase 2 is working.


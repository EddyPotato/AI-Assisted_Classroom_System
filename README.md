# AI-Assisted Smart Campus & Classroom System

Smart campus platform for registrar workflows, classroom/room attendance, and Guard Portal access control using barcode/QR scanning, face recognition, Oracle Database, SignalR, MQTT, and a Python camera edge node.

**Current date/state:** May 6, 2026  
**Current phase:** Guard Portal Phase 2 integration in progress  
**Latest verification:** Frontend lint/build and backend build pass after the latest fixes.

---

## Current Status

### Working or implemented

- React/Vite dashboard with role-based portals:
  - Faculty
  - Guard
  - Principal
  - Registrar
- ASP.NET Core backend with Oracle repositories
- SignalR hub for real-time UI updates
- MQTT listener for edge-node scan and verification events
- Python edge node for:
  - Camera feed
  - Barcode/QR scanning
  - Face recognition
  - MQTT publishing
- Registrar management flows:
  - Students
  - Staff
  - Sections
  - Enrollments
  - Schedules
  - Courses/subjects support
- Guard Portal Phase 2 UI pieces:
  - Camera location selector
  - Start/Stop camera controls
  - Manual ID input fallback
  - Manual bypass modal
  - Live Monitor tab
  - Access History tab
  - Privacy-first recent scan display
- Database includes camera/location-aware access tracking:
  - `CAMERA_LOCATIONS`
  - `EVENT_LOGS.LOCATION_ID`
  - `EVENT_LOGS.BYPASS_REASON`

### Fixed today

- Fixed Guard Portal lint failure caused by state updates inside `LiveCameraFeed.jsx`.
- Moved camera stream cache-token updates into the `GuardPortal.jsx` start-camera flow.
- Fixed backend camera/access code using the wrong Oracle connection-string key.
- `CameraController.cs`, `CameraLocationRepository.cs`, and `AccessVerificationService.cs` now support the same fallback connection-string pattern used elsewhere.
- Confirmed `GET /api/camera/locations` returns HTTP `200`.
- Stopped a lingering backend process that caused `address already in use` on port `5106`.

### Verified commands

```powershell
cd campus-dashboard
npm.cmd run lint
npm.cmd run build

cd ../campus-backend
dotnet build
```

All passed after the latest fixes.

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

---

## Project Structure

```text
AI-Assisted_Classroom_System/
  CONTEXT.md
  README.md
  AI-Assisted_Classroom_System.sln
  campus-backend/
    Controllers/
    Hubs/
    Models/
    Repositories/
    Services/
    ReferenceFaces/
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
  database/
    schema.sql
```

---

## Setup

### Prerequisites

- Node.js 18+
- .NET SDK compatible with the project target
- Python 3.10+
- Oracle Database 21c XE
- MQTT broker, such as Mosquitto
- Git

### 1. Database

Run `database/schema.sql` in Oracle SQL Developer or SQL*Plus.

The backend expects this connection string key in `campus-backend/appsettings.json`:

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

## Running the Full System

Open three terminals:

### Terminal 1

```powershell
cd campus-backend
dotnet run
```

### Terminal 2

```powershell
cd campus-dashboard
npm.cmd run dev
```

### Terminal 3

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

## Guard Portal Flow

### Camera startup

1. Guard opens the Guard Portal.
2. Guard selects a camera location.
3. Guard clicks Start Camera.
4. Frontend calls `POST /api/camera/start`.
5. Backend proxies the request to Python `POST /start_camera`.
6. Python wakes the webcam and serves the MJPEG stream.
7. Guard Portal displays `http://localhost:5000/video_feed`.

### Barcode/face verification

1. Student shows barcode/QR code to the camera.
2. Python reads the code with pyzbar.
3. Python publishes MQTT message to `campus/door/scan`.
4. Backend receives the scan, looks up the student, and broadcasts `ReceiveBarcode`.
5. Python compares the live face with the stored reference face.
6. Python publishes verification result to `campus/door/verified`.
7. Backend logs the event and broadcasts `ReceiveScanResult`.
8. Guard Portal updates in real time.

### Manual ID fallback

1. Guard types a student ID.
2. Frontend calls `POST /api/camera/manual-scan`.
3. Backend looks up the student.
4. UI shows the scan/verification state.

### Manual bypass

1. Guard opens the bypass modal.
2. Guard enters student ID and reason.
3. Backend logs the bypass with `BYPASS_REASON`.
4. UI receives the result through SignalR.

---

## Important API Endpoints

### Camera and Guard Portal

```text
GET  /api/camera/locations
POST /api/camera/locations
PUT  /api/camera/location/{id}
POST /api/camera/start
POST /api/camera/stop
POST /api/camera/manual-scan
```

### Sections

```text
GET    /api/sections
POST   /api/sections
PUT    /api/sections/{id}
DELETE /api/sections/{id}
GET    /api/sections/{id}/students
POST   /api/sections/{id}/students
DELETE /api/sections/{id}/students/{studentId}
GET    /api/sections/{id}/schedule
```

### Other common endpoints

```text
GET /api/student
GET /api/staff
GET /api/rooms
GET /api/schedules
POST /api/enrollments
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

## Troubleshooting

### Port 5106 is already in use

This means the backend is already running or a previous `campus-backend.exe` process is still alive.

```powershell
Get-NetTCPConnection -LocalPort 5106 -ErrorAction SilentlyContinue
Get-Process campus-backend -ErrorAction SilentlyContinue
Stop-Process -Id <PID>
```

Only stop the specific backend process that is using port `5106`.

### `npm` is blocked in PowerShell

Use:

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
```

### Backend returns `ORA-50029`

Check that the backend code is using `OracleConnection` from `appsettings.json`, or the fallback pattern documented in `CONTEXT.md`.

### Camera start fails

Make sure the Python edge node is running:

```powershell
cd campus-edge
venv\Scripts\activate
python vision_node.py
```

### Guard Portal does not receive scan events

Check:

- Backend is running on `5106`
- Frontend is running on `5173`
- Python edge node is running on `5000`
- MQTT broker is running
- Oracle Database is running
- Browser console has no SignalR connection errors

---

## Git Ignore Notes

Do not commit:

- `node_modules/`
- `dist/`
- `bin/`
- `obj/`
- `.env`
- `campus-edge/.env`
- `venv/`
- `.venv/`
- `ReferenceFaces/`
- real student/staff face photos
- media files such as `.jpg`, `.jpeg`, `.png`, `.mp4`

The selected `.gitignore` line `.venv\Scripts\activate` is only a commented note. The actual virtual environment folders are already ignored by `.venv/`, `venv/`, and `env/`.

---

## Next Work

Recommended next tasks:

1. Test the full Guard Portal loop with frontend, backend, Oracle, MQTT, and Python edge node running together.
2. Confirm camera location IDs flow from UI/backend into edge-node scan results where needed.
3. Normalize `EVENT_LOGS.STATUS` values.
4. Improve API error handling around missing camera locations and failed database operations.
5. Continue Guard Portal Phase 2 testing before starting larger refactors.
6. Later, refactor `SectionRoster.jsx` into smaller components.


# AI-Assisted Smart Campus & Classroom System - Comprehensive Project Context

**Last Updated:** May 14, 2026  
**Audit Status:** ✅ Comprehensive dependency audit completed - MQTT Mosquitto broker installation documented  
**Project Status:** Multi-role portal system (Faculty, Guard, Registrar, Principal, SystemAdmin) with registrar workflows, schedule/section management, face verification, and barcode scanning  
**Team Lead:** EddyPotato  
**Current Tech:** React 19.2.5 + Vite 8.0.9 | ASP.NET Core net10.0 | Oracle Database | Python 3.10+ | OpenCV + MQTT Mosquitto  
**Dependencies Docs:** [DEPENDENCIES_AUDIT.md](DEPENDENCIES_AUDIT.md) | [MQTT_SETUP_GUIDE.md](MQTT_SETUP_GUIDE.md) | [DEPENDENCIES_SUMMARY.md](DEPENDENCIES_SUMMARY.md)

## Quick Reference

**This document is comprehensive for vibe coding.** Use this as your single source of truth for:
- System architecture and data flow
- Complete API documentation with examples
- Database schema with detailed column info
- Frontend component structure
- Backend patterns and conventions
- Known issues with workarounds
- Development procedures and testing

**Last verified:** May 14, 2026 (comprehensive dependency audit completed, all endpoints tested, all components built)

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Directory Structure](#directory-structure)
4. [Database Schema (Complete)](#database-schema-complete)
5. [Backend API Endpoints](#backend-api-endpoints)
6. [Frontend Components & Routing](#frontend-components--routing)
7. [Authentication & Authorization](#authentication--authorization)
8. [Real-Time Communication (SignalR)](#real-time-communication-signalr)
9. [Guard Portal: Access Control & Face Verification](#guard-portal-access-control--face-verification)
10. [Registrar Workflows (Section, Schedule, Enrollment)](#registrar-workflows)
11. [Code Patterns & Best Practices](#code-patterns--best-practices)
12. [Known Issues & Fixes](#known-issues--fixes)
13. [Testing & Debugging](#testing--debugging)

---

## System Architecture

### High-Level Flow

```
USER BROWSER (React Frontend)
  │
  ├─ HTTP Requests → ASP.NET Core Backend (port 5106)
  │   ├─ Controllers process request
  │   ├─ Repositories query Oracle
  │   └─ JSON response returned
  │
  ├─ WebSocket → SignalR Hub (ws://localhost:5106/campushub)
  │   ├─ Real-time updates (barcode scans, face verification)
  │   └─ MqttListenerService broadcasts events
  │
  └─ Image Requests → /ReferenceFaces static folder
      └─ Face reference images served via HTTP

BACKEND → MQTT BROKER (Mosquitto, localhost:1883) ⚠️ CRITICAL
  │
  └─ MqttListenerService subscribes to campus/door/*
      └─ Receives barcode & face verification events from edge node
      └─ (⚠️ Without MQTT running: System completely fails)

BACKEND → ORACLE DATABASE (localhost:1521/XEPDB1)
  │
  ├─ USERS, STUDENTS, STAFF → Identity & auth
  ├─ SECTIONS, ENROLLMENTS → Roster management
  ├─ SCHEDULES, SUBJECTS, COURSES, ROOMS → Academic
  ├─ EVENT_LOGS → Access audit trail
  └─ CAMERA_LOCATIONS → Camera configuration

BACKEND → PYTHON EDGE NODE (Flask, http://localhost:5000)
  │
  ├─ GET /video_feed → MJPEG stream
  ├─ POST /start_camera → Activate webcam
  └─ POST /stop_camera → Deactivate webcam
```

### Startup Order (CRITICAL!)

**Start services in this order for successful system initialization:**

1. **MQTT Mosquitto Broker** (localhost:1883) - Must be first!
2. **Oracle Database** (localhost:1521/XEPDB1)
3. **Backend** (ASP.NET Core, localhost:5106)
4. **Frontend** (React + Vite, localhost:5173)
5. **Edge Node** (Python Flask, localhost:5000) - Optional, for Guard Portal

**Why this order?**
- MQTT must be running before Backend (MqttListenerService connects on startup)
- Oracle must be running before Backend (data access initialization)
- Backend must be running before Frontend (API dependencies)
- Edge Node is optional but should start last to avoid connection timeouts

See [DEPENDENCIES_AUDIT.md](DEPENDENCIES_AUDIT.md) for complete installation sequence with verification commands.

---

## Technology Stack

### Frontend
- **React 19.2.5** - UI framework
- **Vite 8.0.9** - Dev server & bundler
- **React Router 7.14.2** - SPA routing
- **Tailwind CSS 4.2.4** - Styling
- **@microsoft/signalr 10.0.0** - WebSocket client for real-time updates
- **Lucide React 1.8.0** - Icons

### Backend
- **.NET 10.0** - Web framework (ASP.NET Core)
- **Oracle.ManagedDataAccess.Core 23.26.200** - Oracle driver
- **BCrypt.Net-Next 4.1.0** - Password hashing
- **MQTTnet 4.3.7.1207** - MQTT client for edge node events
- **Newtonsoft.Json** - JSON serialization
- **SignalR** - Real-time WebSocket communication

### Database
- **Oracle Database 21c XE** - XEPDB1 instance
- **Owner:** campus_admin / admin123

### Messaging & Real-Time (CRITICAL)
- **MQTT Mosquitto 1.6+** - Lightweight message broker (localhost:1883)
  - **⚠️ CRITICAL:** Campus edge node publishes barcode & face events via MQTT
  - **Without MQTT running:** System completely fails - SignalR cannot broadcast real-time events
  - **See:** [MQTT_SETUP_GUIDE.md](MQTT_SETUP_GUIDE.md) for complete installation & setup instructions

### Edge Node (Python)
- **Python 3.10+**
- **OpenCV 4.9.0+** - Video processing
- **face_recognition 1.3.0+** - Face detection & matching
- **dlib 19.24.2+** - Face encoding (⚠️ Windows: Requires Visual C++ Build Tools + CMake - 10-20 min compile)
- **pyzbar 0.1.9+** - Barcode/QR code scanning
- **Flask 3.0.3+** - Web server
- **paho-mqtt 1.6.1+** - MQTT client
- **gunicorn 21.0.0+** - WSGI server for production (NEW - added to requirements.txt)
- **supervisor 4.2.0+** - Process manager for production auto-restart (NEW - added to requirements.txt)
- **python-json-logger 2.0.0+** - JSON logging for production (NEW - added to requirements.txt)

**See:** [DEPENDENCIES_AUDIT.md](DEPENDENCIES_AUDIT.md) for complete version compatibility matrix, platform-specific build requirements, and installation procedures.

---

## Directory Structure

```
AI-Assisted_Classroom_System/
├── README.md                          (Getting started guide)
├── CONTEXT.md                         (This file - detailed technical reference)
├── DEPENDENCIES_AUDIT.md              (Complete audit of all packages & versions - 3,600 lines)
├── MQTT_SETUP_GUIDE.md                (MQTT Mosquitto installation & troubleshooting - all OS)
├── DEPENDENCIES_SUMMARY.md            (Executive summary of audit findings)
├── AI-Assisted_Classroom_System.sln   (Visual Studio solution)
│
├── database/
│   └── schema.sql                     (Oracle DDL + seed data)
│
├── campus-backend/                    (ASP.NET Core REST API)
│   ├── Controllers/
│   │   ├── AttendanceController.cs
│   │   ├── AuthController.cs          (Login endpoint)
│   │   ├── CameraController.cs
│   │   ├── CoursesController.cs
│   │   ├── EnrollmentsController.cs   (Student-to-section mapping)
│   │   ├── RoomsController.cs
│   │   ├── SchedulesController.cs     (CRUD + bulk import)
│   │   ├── SectionsController.cs      (CRUD + roster)
│   │   ├── StaffController.cs
│   │   ├── StudentController.cs       (Student directory)
│   │   ├── SubjectsController.cs
│   │   └── UserController.cs
│   ├── Repositories/
│   │   ├── IStudentRepository.cs → StudentRepository.cs
│   │   ├── ISectionRepository.cs → SectionRepository.cs
│   │   ├── IScheduleRepository.cs → ScheduleRepository.cs
│   │   ├── IEnrollmentRepository.cs → EnrollmentRepository.cs
│   │   ├── IAttendanceRepository.cs → AttendanceRepository.cs
│   │   ├── ICourseRepository.cs → CourseRepository.cs
│   │   ├── IRoomRepository.cs → RoomRepository.cs
│   │   ├── ISubjectRepository.cs → SubjectRepository.cs
│   │   ├── IUserRepository.cs → UserRepository.cs
│   │   ├── ICameraLocationRepository.cs → CameraLocationRepository.cs
│   │   └── [... more repository implementations]
│   ├── Models/
│   │   ├── User.cs
│   │   ├── Student.cs                 (Student identity + enrollment)
│   │   ├── Section.cs                 (Class section definition)
│   │   ├── Schedule.cs                (Class time slot)
│   │   ├── Subject.cs
│   │   ├── Course.cs
│   │   ├── Room.cs
│   │   ├── CameraLocation.cs
│   │   ├── LoginRequest.cs
│   │   └── [... model DTOs]
│   ├── Services/
│   │   ├── AccessVerificationService.cs     (State machine for barcode + face)
│   │   ├── MqttListenerService.cs           (MQTT subscriber + SignalR broadcaster)
│   │   ├── IImageUploadService.cs
│   │   └── ImageUploadService.cs
│   ├── Hubs/
│   │   └── CampusHub.cs               (SignalR hub for real-time events)
│   ├── ReferenceFaces/                (Directory for face reference images)
│   ├── Program.cs                     (Startup & dependency injection)
│   ├── appsettings.json               (Configuration)
│   └── campus-backend.csproj
│
├── campus-dashboard/                  (React + Vite SPA)
│   ├── src/
│   │   ├── App.jsx                    (Main router + role dispatcher)
│   │   ├── main.jsx                   (Entry point)
│   │   ├── index.css                  (Global styles)
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx          (Login form)
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── LoginHeader.jsx
│   │   │   └── ui/
│   │   │       ├── Header.jsx
│   │   │       └── Sidebar.jsx
│   │   ├── api/                       (Empty - API calls are inline)
│   │   ├── assets/
│   │   └── portals/
│   │       ├── Faculty/
│   │       │   ├── FacultyDashboard.jsx      (Dashboard)
│   │       │   └── ClassAttendance.jsx       (Attendance tracking)
│   │       ├── Guard/
│   │       │   ├── GuardPortal.jsx          (Main access monitoring)
│   │       │   ├── components/
│   │       │   │   ├── GuardHeader.jsx
│   │       │   │   ├── LiveMonitorView.jsx
│   │       │   │   └── AccessHistory.jsx
│   │       │   └── views/
│   │       ├── Registrar/
│   │       │   ├── RegistrarPortal.jsx      (Main registrar interface)
│   │       │   ├── components/
│   │       │   │   ├── schedules/           (Schedule CRUD + table)
│   │       │   │   ├── sections/            (Section CRUD + roster)
│   │       │   │   ├── users/               (Student/staff directories)
│   │       │   │   ├── faculty/
│   │       │   │   ├── resources/           (Subjects, courses)
│   │       │   │   └── enrollment/
│   │       │   └── views/
│   │       │       └── ScheduleImporter.jsx (Bulk CSV import)
│   │       ├── Principal/
│   │       │   └── PrincipalPortal.jsx      (Oversight & reporting)
│   │       └── SystemAdmin/
│   │           └── SystemAdminPortal.jsx    (System configuration)
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
│
└── campus-edge/                       (Python vision & camera node)
    ├── app.py                         (Flask web server)
    ├── vision.py                      (Face detection & barcode scanning)
    ├── camera.py                      (Webcam control)
    ├── config.py                      (Configuration)
    ├── requirements.txt               (Python dependencies - core + production)
    ├── requirements-dev.txt           (Development-only dependencies: pytest, black, pylint, mypy - NEW)
    ├── .env                           (MQTT credentials - not in git)
    └── venv/                          (Virtual environment - not in git)
```

---

## Database Schema (Complete)

### Overview

**Owner:** campus_admin  
**Connection:** `Data Source=localhost:1521/XEPDB1;User Id=campus_admin;Password=admin123;`  
**Tables:** 11 core + 1 sequence  
**Relationships:** Foreign keys enforce referential integrity

### Table Definitions

#### USERS
```sql
CREATE TABLE USERS (
  USER_ID VARCHAR2(20) PRIMARY KEY,
  FIRST_NAME VARCHAR2(50),
  MIDDLE_NAME VARCHAR2(50),
  LAST_NAME VARCHAR2(50),
  PASSWORD VARCHAR2(255),         -- BCrypt hash (60 chars) or legacy plaintext
  ROLE VARCHAR2(20),              -- 'Faculty', 'Guard', 'Registrar', 'Principal', 'SystemAdmin'
  EMAIL VARCHAR2(100),
  CONTACT_NUMBER VARCHAR2(20),
  ADDRESS VARCHAR2(255),
  STATUS VARCHAR2(20) DEFAULT 'Active',
  FACE_REFERENCE_PATH VARCHAR2(255), -- Path like '/ReferenceFaces/prof-001.jpg'
  CAMPUS_PRESENCE VARCHAR2(20) DEFAULT 'offline'
);
```

**Notes:**
- PASSWORD: Legacy plaintext auto-hashes on first BCrypt verification
- ROLE: Determines portal access level & feature visibility
- FACE_REFERENCE_PATH: Optional, for Guard Portal face matching

#### STUDENTS
```sql
CREATE TABLE STUDENTS (
  STUDENT_ID VARCHAR2(20) PRIMARY KEY,
  FIRST_NAME VARCHAR2(50),
  MIDDLE_NAME VARCHAR2(50),
  LAST_NAME VARCHAR2(50),
  FACE_REFERENCE_PATH VARCHAR2(255),
  ENROLLMENT_STATUS VARCHAR2(50) DEFAULT 'Regular',  -- Regular, Probation, Irregular
  CONTACT_NUMBER VARCHAR2(20),
  BIRTHDAY VARCHAR2(50),
  ADDRESS VARCHAR2(255),
  CAMPUS_PRESENCE VARCHAR2(20) DEFAULT 'offline'
);
```

#### SECTIONS
```sql
CREATE TABLE SECTIONS (
  SECTION_ID VARCHAR2(20) PRIMARY KEY,
  CAMPUS VARCHAR2(10),            -- SB, SF, BA (reference CAMPUSES)
  COURSE VARCHAR2(20),            -- BSIT, BSCS, BSA, etc. (reference COURSES)
  YEAR_LEVEL NUMBER,              -- 1, 2, 3, 4
  SECTION_LETTER VARCHAR2(5),     -- A, B, C, etc.
  SECTION_NAME VARCHAR2(20)       -- Display name like '1A', '2B'
);
```

**⚠️ Known Issue:** No STATUS column - cannot archive/restore sections without schema modification

#### ENROLLMENTS
```sql
CREATE TABLE ENROLLMENTS (
  ENROLLMENT_ID VARCHAR2(20) PRIMARY KEY,
  STUDENT_ID VARCHAR2(20) REFERENCES STUDENTS(STUDENT_ID),
  SECTION_ID VARCHAR2(20) REFERENCES SECTIONS(SECTION_ID),
  ENROLLMENT_DATE DATE DEFAULT SYSDATE,
  CONSECUTIVE_ABSENCES NUMBER DEFAULT 0
);
```

#### SCHEDULES
```sql
CREATE TABLE SCHEDULES (
  SCHEDULE_ID VARCHAR2(20) PRIMARY KEY,
  SUBJECT_CODE VARCHAR2(20) REFERENCES SUBJECTS(SUBJECT_CODE),
  SECTION_ID VARCHAR2(20) REFERENCES SECTIONS(SECTION_ID),
  PROFESSOR_ID VARCHAR2(20),      -- FK to USERS, nullable
  ROOM_ID VARCHAR2(20),           -- FK to ROOMS, nullable
  TIME_START VARCHAR2(20),        -- Format: '02:30 PM' (VARCHAR, not TIMESTAMP)
  TIME_END VARCHAR2(20),          -- Format: '05:30 PM'
  CLASS_DAYS VARCHAR2(50),        -- Format: 'Monday/Wednesday/Friday'
  SUBJECT_TYPE VARCHAR2(10) DEFAULT 'Lec' -- Lec or Lab
);
```

**Critical Notes:**
- TIME_START/TIME_END are VARCHAR2 (requires manual parsing in code)
- PROFESSOR_ID & ROOM_ID are nullable (optional scheduling)
- CLASS_DAYS uses slash-separated day names (inconsistent formatting in current data)

#### SUBJECTS
```sql
CREATE TABLE SUBJECTS (
  SUBJECT_CODE VARCHAR2(20) PRIMARY KEY,
  TITLE VARCHAR2(100),
  PREREQUISITES VARCHAR2(100),
  UNITS NUMBER
);
```

#### COURSES
```sql
CREATE TABLE COURSES (
  COURSE_CODE VARCHAR2(20) PRIMARY KEY,
  COURSE_NAME VARCHAR2(100),
  DEPARTMENT VARCHAR2(100)
);
```

#### ROOMS
```sql
CREATE TABLE ROOMS (
  ROOM_ID VARCHAR2(20) PRIMARY KEY,
  BUILDING VARCHAR2(100),
  FLOOR NUMBER,
  ROOM_TYPE VARCHAR2(50),          -- Classroom, Lab, etc.
  STATUS VARCHAR2(20) DEFAULT 'Inactive',
  CAMPUS VARCHAR2(10) DEFAULT 'SB'
);
```

#### CAMPUSES
```sql
CREATE TABLE CAMPUSES (
  CAMPUS_CODE VARCHAR2(10) PRIMARY KEY,
  CAMPUS_NAME VARCHAR2(100),
  IS_MAIN NUMBER(1,0) DEFAULT 0    -- 1 = main campus, 0 = satellite
);
```

**Seed Data:**
- SB (San Bartolome) - Main campus
- SF (San Francisco) - Satellite
- BA (Batasan) - Satellite

#### CAMERA_LOCATIONS
```sql
CREATE TABLE CAMERA_LOCATIONS (
  LOCATION_ID VARCHAR2(20) PRIMARY KEY,
  CAMERA_NAME VARCHAR2(100),
  LOCATION_TYPE VARCHAR2(20),      -- entrance, exit, room
  ASSOCIATED_ROOM_ID VARCHAR2(20), -- FK to ROOMS, nullable
  IS_ACTIVE NUMBER(1,0) DEFAULT 1,
  CREATED_AT TIMESTAMP DEFAULT SYSDATE,
  LOGIC_TYPE VARCHAR2(20) DEFAULT 'gate' -- gate or room
);
```

**Logic Types:**
- **gate:** Entrance/exit camera - requires barcode OR face match
- **room:** Classroom camera - verifies student is enrolled AND class time matches

#### EVENT_LOGS
```sql
CREATE TABLE EVENT_LOGS (
  LOG_ID NUMBER IDENTITY,                         -- Auto-increment
  STUDENT_ID VARCHAR2(50),
  STATUS VARCHAR2(50),            -- INCONSISTENT: 'approved', 'denied', 'Access Granted'
  MATCH_CONFIDENCE NUMBER,         -- Face confidence 0-100, NULL for barcode/manual
  TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  BYPASS_REASON VARCHAR2(255),    -- Why access was granted without match
  LOCATION_ID VARCHAR2(20)        -- FK to CAMERA_LOCATIONS
);
```

**⚠️ Known Issue:** STATUS values inconsistent across records - should normalize to enum

### Key Relationships

```
USERS (1) ──n─── SCHEDULES (PROFESSOR_ID)
USERS (1) ──n─── EVENT_LOGS (implicitly via STUDENT_ID... wait, should be separate)

STUDENTS (1) ──n─── ENROLLMENTS
STUDENTS (1) ──n─── EVENT_LOGS

SECTIONS (1) ──n─── ENROLLMENTS
SECTIONS (1) ──n─── SCHEDULES

COURSES (1) ──n─── SECTIONS (via COURSE)
SUBJECTS (1) ──n─── SCHEDULES (via SUBJECT_CODE)
ROOMS (1) ──n─── SCHEDULES (via ROOM_ID)
CAMPUSES (1) ──n─── SECTIONS (via CAMPUS)
CAMPUSES (1) ──n─── ROOMS (via CAMPUS)

CAMERA_LOCATIONS (1) ──n─── EVENT_LOGS
```

---

## Backend API Endpoints

### BASE URL: http://localhost:5106

**CORS Enabled For:** http://localhost:5173  
**Response Format:** JSON  
**Error Responses:** HTTP status + { message, error? }

### Authentication

#### POST /api/auth/login
Login with username and password. Stores user in frontend `sessionStorage`.

**Request:**
```json
{
  "username": "registrar1",
  "password": "password"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "User_ID": "registrar1",
    "First_Name": "John",
    "Last_Name": "Doe",
    "Role": "Registrar",
    "Email": "registrar@campus.edu",
    "Contact_Number": "+63-555-0001",
    "Face_Reference_Path": "/ReferenceFaces/registrar1.jpg",
    "Status": "Active",
    "Campus_Presence": "online"
  }
}
```

**Response (401):**
```json
{
  "message": "Invalid User ID or Password."
}
```

**Backend Logic:**
1. Fetch user by username
2. If plaintext matches, auto-hash with BCrypt for future logins
3. Otherwise verify using BCrypt
4. Scrub password field before returning

---

### Students

#### GET /api/student
Get all students.

**Response (200):**
```json
[
  {
    "Student_ID": "24-1487",
    "First_Name": "Jane",
    "Middle_Name": "Ann",
    "Last_Name": "Smith",
    "Face_Reference_Path": "/ReferenceFaces/24-1487.jpg",
    "Enrollment_Status": "Regular",
    "Contact_Number": "+63-555-0100",
    "Birthday": "2002-05-15",
    "Address": "123 Main St, Manila",
    "Campus_Presence": "online"
  }
]
```

#### GET /api/student/{id}
Get a specific student.

---

### Sections

#### GET /api/sections
Get all sections (with Campus and Section_Letter for edit fidelity).

**Response (200):**
```json
[
  {
    "Section_ID": "SEC-001",
    "Campus": "SB",
    "Course": "BSIT",
    "Year_Level": 1,
    "Section_Letter": "A",
    "Section_Name": "1A"
  }
]
```

#### POST /api/sections
Create a new section.

**Request:**
```json
{
  "Section_Name": "2B",
  "Course": "BSCS",
  "Campus": "SB",
  "Year_Level": 2,
  "Section_Letter": "B"
}
```

#### PUT /api/sections/{id}
Update an existing section.

#### DELETE /api/sections/{id}
Delete a section.

#### GET /api/sections/{id}/students
Get all enrolled students (with enrollment metadata).

**Response (200):**
```json
[
  {
    "Enrollment_ID": "ENR-458725F8",
    "Student_ID": "24-1487",
    "First_Name": "Jane",
    "Last_Name": "Smith",
    "Enrollment_Date": "2026-05-06",
    "Consecutive_Absences": 0
  }
]
```

#### POST /api/sections/{id}/students
Bulk enroll students.

**Request:**
```json
["24-1487", "26-0001", "26-0002"]
```

#### DELETE /api/sections/{sectionId}/students/{studentId}
Remove a student from section.

#### GET /api/sections/{id}/schedule
Get all schedules for a section (with expanded subject/professor/room names).

**Response (200):**
```json
[
  {
    "Schedule_ID": "SCH-001",
    "Subject_Code": "SE101",
    "Subject_Title": "Software Engineering 1",
    "Section_ID": "SEC-001",
    "Section_Name": "1A",
    "Professor_ID": "prof-001",
    "Professor_Name": "Dr. John Reyes",
    "Professor_Face_Reference_Path": "/ReferenceFaces/prof-001.jpg",
    "Room_ID": "IK604",
    "Building": "IK Building",
    "Time_Start": "02:30 PM",
    "Time_End": "05:30 PM",
    "Class_Days": "Monday/Wednesday",
    "Subject_Type": "Lec"
  }
]
```

---

### Schedules

#### GET /api/schedules
Get all schedules with expanded metadata.

#### POST /api/schedules
Create a schedule.

**Request:**
```json
{
  "Schedule_ID": "SCH-NEW-001",
  "Subject_Code": "SE101",
  "Section_ID": "SEC-001",
  "Professor_ID": "prof-001",
  "Room_ID": "IK604",
  "Time_Start": "02:30 PM",
  "Time_End": "05:30 PM",
  "Class_Days": "Monday/Wednesday",
  "Subject_Type": "Lec"
}
```

#### PUT /api/schedules/{id}
Update a schedule.

#### DELETE /api/schedules/{id}
Delete a schedule.

#### POST /api/schedules/import
Bulk import schedules from array.

**Request:**
```json
[
  {
    "Subject_Code": "SE101",
    "Section_Id": "SEC-001",
    "Professor_Id": "prof-001",
    "Room_Id": "IK604",
    "Time_Start": "02:30 PM",
    "Time_End": "05:30 PM",
    "Class_Days": "Thursday",
    "Subject_Type": "Lec"
  }
]
```

**Response (200):**
```json
{
  "message": "Successfully imported 3 schedules."
}
```

---

### Courses, Subjects, Rooms, Staff

#### GET /api/courses
Get all courses (programs).

#### GET /api/subjects
Get all subjects.

#### GET /api/rooms
Get all rooms.

#### GET /api/staff
Get all staff members.

---

### Attendance & Enrollments

#### GET /api/attendance
Get all event logs (access/attendance records).

**Response (200):**
```json
[
  {
    "Log_ID": 1,
    "Student_ID": "24-1487",
    "Status": "approved",
    "Match_Confidence": 95,
    "Timestamp": "2026-05-06T16:36:45",
    "Bypass_Reason": null,
    "Location_ID": "CAM-001"
  }
]
```

#### GET /api/enrollments
Get all student-to-section mappings.

---

### Camera

#### GET /api/camera/locations
Get all active camera locations.

**Response (200):**
```json
[
  {
    "Location_ID": "CAM-001",
    "Camera_Name": "Main Entrance Gate",
    "Location_Type": "entrance",
    "Associated_Room_ID": null,
    "Is_Active": 1,
    "Created_At": "2026-05-06T20:10:48",
    "Logic_Type": "gate"
  }
]
```

#### POST /api/camera/locations
Create a new camera location.

#### PUT /api/camera/locations/{id}
Update a camera location.

#### DELETE /api/camera/locations/{id}
Delete a camera location.

---

## Frontend Components & Routing

### App.jsx - Master Router

**Logic:**
1. Reads `sessionStorage.campus_user` (JSON user object)
2. Extracts role: `user.role || user.Role`
3. Dispatches to portal component
4. Unauthenticated users redirected to `/login`

```javascript
function RoleDispatcher() {
  const user = JSON.parse(sessionStorage.getItem('campus_user') || '{}');
  const userRole = user.role || user.Role;
  
  switch (userRole) {
    case 'Faculty': return <CampusLayout />;
    case 'Guard': return <GuardPortal />;
    case 'Registrar': return <RegistrarPortal />;
    case 'Principal': return <PrincipalPortal />;
    case 'SystemAdmin': return <SystemAdminPortal />;
    default: return <Navigate to="/login" />;
  }
}
```

### Login Component

**File:** `components/auth/Login.jsx`

**Flow:**
1. User enters username & password
2. HTTP POST to `/api/auth/login`
3. Backend returns user object
4. Frontend stores in `sessionStorage.campus_user`
5. Redirects to role portal

### Portal Components

#### Faculty Portal
**Files:** `portals/Faculty/FacultyDashboard.jsx`, `ClassAttendance.jsx`

**Features:**
- Dashboard with class overview
- Attendance tracking interface
- Student roster per class
- Schedule view

#### Guard Portal
**Files:** `portals/Guard/GuardPortal.jsx` + subcomponents

**Features:**
- Live camera stream (MJPEG from edge node)
- Barcode/QR code input
- Real-time face verification status
- Access history log
- Manual ID entry fallback

**⚠️ Known Issue:** Reads from `localStorage` instead of `sessionStorage`

#### Registrar Portal
**Files:** `portals/Registrar/RegistrarPortal.jsx` + subcomponents

**Features:**
1. **Section Directory** (`components/sections/`)
   - Table with Campus, Program, Year, Letter, Student Count
   - Actions: View Roster, Edit, Delete
   - Filters: Program, Year, Search

2. **Schedule Management** (`components/schedules/`)
   - Table with Subject, Section, Professor, Room, Time, Days
   - CRUD operations
   - Bulk import via CSV

3. **Student/Staff Directories** (`components/users/`)
   - Searchable tables
   - Contact information, enrollment status

4. **Enrollment Management** (`components/enrollment/`)
   - Bulk add/remove students from sections
   - View per-student enrollment history

5. **Schedule Importer** (`views/ScheduleImporter.jsx`)
   - CSV/Excel file upload
   - Preview parsed data
   - Import with validation

#### Principal Portal
**File:** `portals/Principal/PrincipalPortal.jsx`

**Status:** Structure in place, workflows to be implemented

#### SystemAdmin Portal
**File:** `portals/SystemAdmin/SystemAdminPortal.jsx`

**Status:** Structure in place, configuration tools TBD

---

## Authentication & Authorization

### Session Management

**Storage:** `sessionStorage` (cleared on tab close)  
**Key:** `campus_user`  
**Value:** JSON-serialized user object

```javascript
// Login.jsx stores user
sessionStorage.setItem('campus_user', JSON.stringify(user));

// Any portal retrieves user
const user = JSON.parse(sessionStorage.getItem('campus_user'));
```

### RBAC (Role-Based Access Control)

**Five Roles:**
1. **Faculty** → Class attendance & roster
2. **Guard** → Access monitoring & verification
3. **Registrar** → Section, schedule, enrollment management
4. **Principal** → Dashboard & oversight
5. **SystemAdmin** → System configuration

**Enforcement:**
- Frontend: `ProtectedRoute` component checks `sessionStorage`
- Backend: Controllers receive user context (can add role validation)

### Password Security

**Backend (`AuthController.cs`):**

1. **Plaintext Legacy Support**
   ```csharp
   if (user.Password == request.Password) {
     // Auto-hash with BCrypt for future logins
     var newHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
     await _userRepository.UpdatePasswordAsync(user.User_ID, newHash);
   }
   ```

2. **BCrypt Verification**
   ```csharp
   bool isValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
   ```

3. **Null-Check Protection**
   ```csharp
   if (string.IsNullOrEmpty(user.Password)) {
     return Unauthorized("This account has no password set.");
   }
   ```

4. **Response Scrubbing**
   ```csharp
   user.Password = null;  // Don't send hash to frontend
   return Ok(new { message = "Login successful", user });
   ```

---

## Real-Time Communication (SignalR)

### WebSocket Hub

**Location:** `campus-backend/Hubs/CampusHub.cs`  
**URL:** `ws://localhost:5106/campushub`  
**Protocol:** SignalR JSON RPC

### Message Flow

```
Python Edge Node
  ↓
MQTT Broker (localhost:1883)
  ↓
MqttListenerService (C#)
  ↓
CampusHub.Clients.All.SendAsync(methodName, payload)
  ↓
Connected Frontend Clients (GuardPortal.jsx)
```

### Broadcast Methods

| Method | Trigger | Payload |
|--------|---------|---------|
| `ReceiveBarcode` | Pyzbar detects barcode | `{ barcode: "24-1487", timestamp: "..." }` |
| `ReceiveScanResult` | Face match completed | `{ verified: true, confidence: 95, student_id: "..." }` |

### Frontend Subscription

```javascript
import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
  .withUrl('http://localhost:5106/campushub')
  .withAutomaticReconnect()
  .build();

connection.on('ReceiveBarcode', (data) => {
  console.log('Barcode scanned:', data.barcode);
  setLastBarcode(data.barcode);
});

connection.on('ReceiveScanResult', (data) => {
  console.log('Face verification result:', data);
  setVerificationResult({
    verified: data.verified,
    confidence: data.confidence
  });
});

connection.start().catch(err => console.error(err));

// Cleanup on unmount
return () => connection.stop();
```

---

## Guard Portal: Access Control & Face Verification

### Two-Phase Verification System

**Service:** `AccessVerificationService.cs` (Singleton)

**Phase 1: Barcode Identification (Immediate)**
1. Guard Portal submits barcode (or manually types student ID)
2. Edge node scans barcode → publishes to MQTT `campus/door/scan`
3. MqttListenerService receives → broadcasts to frontend via SignalR
4. AccessVerificationService stores pending student data (name, face reference path)
5. Starts 6-second Phase 2 timeout

**Phase 2: Face Verification (Within 6 seconds)**
1. Edge node captures frames → runs face detection
2. Compares detected face against reference image
3. Edge node publishes match result to MQTT `campus/door/verified`
4. MqttListenerService broadcasts to frontend
5. AccessVerificationService evaluates confidence:
   - **≥ 0.45 (STRICT_THRESHOLD):** Access granted ✓
   - **< 0.45:** Access denied ✗

### Verification Decision Logic

```csharp
if (barcode_successfully_scanned) {
  // BARCODE FIRST: Don't wait for face verification
  eventLog.Status = "approved";
  eventLog.Bypass_Reason = "barcode_read";
  eventLog.Match_Confidence = null;
  _abortPhase2 = true;  // Cancel Phase 2
} 
else if (face_match_confidence >= STRICT_THRESHOLD) {
  // FACE MATCH: Confidence high enough
  eventLog.Status = "approved";
  eventLog.Match_Confidence = confidence;
  eventLog.Bypass_Reason = null;
} 
else {
  // DENY: No valid ID method
  eventLog.Status = "denied";
  eventLog.Match_Confidence = confidence;
  eventLog.Bypass_Reason = null;
}

// INSERT into EVENT_LOGS
await _attendanceRepo.LogEventAsync(eventLog);
```

### Reference Face Matching (Edge Node)

**Logic (`vision.py`):**

1. Load all `.jpg` files from `ReferenceFaces/` directory
2. Encode each face using `face_recognition.face_encodings()`
3. On verification request:
   - Capture frame from webcam
   - Run face detection
   - Encode detected face
   - Compare against all reference encodings
4. Return closest match + confidence score

**Confidence Calculation:**
```python
# face_distance returns euclidean distance (lower = more similar)
face_dist = face_distance(reference_encoding, captured_encoding)
confidence = max(0, 100 * (1 - face_dist))
```

**Threshold (`config.py`):**
```python
STRICT_THRESHOLD = 0.45  # Distance-based, not percentage
```

---

## Registrar Workflows

### Section Directory Workflow

**UI Location:** `portals/Registrar/components/sections/SectionDirectory.jsx`  
**Table Columns:**
- Section ID (non-editable)
- Campus (from SECTIONS.CAMPUS)
- Program (from COURSES.COURSE_NAME)
- Year Level (from SECTIONS.YEAR_LEVEL)
- Letter (from SECTIONS.SECTION_LETTER)
- Student Count (COUNT from ENROLLMENTS)
- Actions (View Roster, Edit, Delete)

**Filters:**
- Program dropdown (filters by COURSE)
- Year level buttons (1, 2, 3, 4)
- Search text input (searches section name/ID)

**Actions:**
- **View Roster:** GET `/api/sections/{id}/students` → Modal
- **Edit:** Edit modal with campus, course, year, letter fields
- **Delete:** Confirmation, DELETE `/api/sections/{id}`

### Schedule Management Workflow

**UI Location:** `portals/Registrar/components/schedules/`  
**Table Columns (sortable):**
- Schedule ID
- Subject Code
- Subject Title
- Section
- Professor Name + Face Image
- Room ID
- Time Slot (start - end)
- Days
- Subject Type (Lec/Lab)

**Time Sorting (Numeric):**
```javascript
const timeToMinutes = (timeStr) => {
  const [time, period] = timeStr.split(' ');
  let [hours, mins] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + mins;
};
// "02:30 PM" → 870, "08:00 AM" → 480
```

**Actions:**
- **Create:** Modal with all schedule fields
- **Edit:** Edit modal
- **Delete:** Confirmation
- **Import:** ScheduleImporter.jsx workflow

### Bulk Schedule Import Workflow

**File:** `portals/Registrar/views/ScheduleImporter.jsx`

**Steps:**
1. User selects CSV/Excel file
2. Frontend parses rows (Papa Parse or native)
3. Display preview table
4. User reviews & clicks Import
5. POST to `/api/schedules/import` with array
6. Backend inserts all schedules
7. Return success count + any error details

**CSV Format:**
```
Subject_Code,Section_Id,Professor_Id,Room_Id,Time_Start,Time_End,Class_Days,Subject_Type
SE101,SEC-001,prof-001,IK604,02:30 PM,05:30 PM,Thursday,Lec
```

**Backend Validation:**
- Required fields: Subject_Code, Section_Id, Time_Start, Time_End
- Foreign key checks
- Per-record error tracking (doesn't abort on individual failures)

### Enrollment Management Workflow

**Bulk Enrollment:**
1. Registrar navigates to Section Roster
2. Clicks "Add Students"
3. Multi-select modal with searchable student list
4. POST to `/api/sections/{id}/students` with student ID array
5. ENROLLMENTS records created

**Bulk Unenrollment:**
1. Select students from roster (checkboxes)
2. Confirm deletion
3. DELETE `/api/sections/{sectionId}/students/{studentId}` per student
4. ENROLLMENTS records deleted

---

## Code Patterns & Best Practices

### Backend Patterns

#### Repository Pattern
```csharp
// Interface definition
public interface IStudentRepository {
  Task<List<Student>> GetAllStudentsAsync();
  Task<Student?> GetStudentByIdAsync(string id);
  Task CreateStudentAsync(Student student);
}

// Concrete implementation
public class StudentRepository : IStudentRepository {
  private readonly IConfiguration _config;
  
  public async Task<List<Student>> GetAllStudentsAsync() {
    using var connection = new OracleConnection(connectionString);
    await connection.OpenAsync();
    using var command = new OracleCommand("SELECT * FROM STUDENTS", connection);
    using var reader = await command.ExecuteReaderAsync();
    
    var students = new List<Student>();
    while (await reader.ReadAsync()) {
      students.Add(new Student {
        Student_ID = reader["STUDENT_ID"].ToString(),
        First_Name = reader["FIRST_NAME"].ToString(),
        // ... map columns
      });
    }
    return students;
  }
}

// DI in Program.cs
builder.Services.AddScoped<IStudentRepository, StudentRepository>();

// Usage in controller
public StudentController(IStudentRepository repo) {
  _repository = repo;
}
```

#### Error Handling
```csharp
[HttpGet]
public async Task<IActionResult> GetStudent(string id) {
  try {
    var student = await _repository.GetStudentByIdAsync(id);
    if (student == null)
      return NotFound(new { message = "Student not found" });
    return Ok(student);
  } catch (Exception ex) {
    return StatusCode(500, new { message = "Database error", error = ex.Message });
  }
}
```

#### Nullable Reference Types
```csharp
public class Student {
  public string Student_ID { get; set; } = string.Empty;  // Non-nullable
  public string? Middle_Name { get; set; }                 // Nullable
}
```

### Frontend Patterns

#### Protected Route
```javascript
function ProtectedRoute({ children }) {
  const user = sessionStorage.getItem('campus_user');
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
```

#### useEffect for Data Fetching
```javascript
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5106/api/sections');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSections(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);  // Dependency array: [] = run once on mount
```

#### State Management
```javascript
const [sections, setSections] = useState([]);
const [selected, setSelected] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
```

#### Conditional Rendering
```javascript
{loading && <p>Loading...</p>}
{error && <p className="text-red-500">{error}</p>}
{sections.length === 0 && !loading && <p>No sections</p>}
{sections.map(s => (
  <tr key={s.Section_ID}>
    <td>{s.Section_Name}</td>
    {/* ... */}
  </tr>
))}
```

---

## Known Issues & Fixes

### Issue #1: GuardPortal sessionStorage/localStorage Mismatch

**Problem:**
- `Login.jsx` stores user in `sessionStorage`
- `GuardPortal.jsx` reads from `localStorage`
- Result: Guard Portal loses user context on reload

**Current Workaround:** Mismatch partially hides issue with persistent login

**Fix Required:**
```javascript
// GuardPortal.jsx
// OLD (WRONG)
const user = JSON.parse(localStorage.getItem('campus_user'));

// NEW (CORRECT)
const user = JSON.parse(sessionStorage.getItem('campus_user'));
```

**Priority:** HIGH (Security issue)

---

### Issue #2: EVENT_LOGS.STATUS Values Inconsistent

**Problem:**
```sql
-- Database has mixed values:
'approved', 'denied', 'Access Granted'
-- Should be normalized to enum
```

**Impact:**
- Frontend filtering difficult
- API logic brittle (case-sensitive comparisons)
- Data integrity uncertain

**Fix Required:**
```sql
-- 1. Define enum in code: APPROVED, DENIED, BYPASSED
-- 2. Backfill existing data
UPDATE EVENT_LOGS SET STATUS = 'APPROVED' WHERE STATUS IN ('approved', 'Access Granted');
UPDATE EVENT_LOGS SET STATUS = 'DENIED' WHERE STATUS = 'denied';
-- 3. Add backend validation to enforce enum
```

**Priority:** MEDIUM (Data quality)

---

### Issue #3: SECTIONS Table Missing STATUS Column

**Problem:**
- No way to soft-delete sections
- Archive/restore UI cannot be implemented

**Fix Required:**
```sql
ALTER TABLE SECTIONS ADD (STATUS VARCHAR2(20) DEFAULT 'Active');
```

**Priority:** LOW (Only if archive feature needed)

---

### Issue #4: CLASS_DAYS Format Inconsistency

**Problem:**
```sql
-- Different formats in database:
'Monday/Wednesday', 'Mon/Wed', 'Thu', 'Thursday'
```

**Current Workaround:** Frontend handles multiple formats

**Fix (if needed):** Normalize to `'MON|WED|FRI'` (pipe-separated ISO abbreviations)

**Priority:** LOW

---

### Issue #5: Vite Bundle Size Warning

**Problem:**
```
⚠️ Vite: Some chunks are large (chunk-xxx.js: 250 kB)
Production build: ~600+ kB (normal for multi-role SPA)
```

**Current Status:** Non-blocking, normal

**Fix (if needed):**
```javascript
// Lazy-load portals in App.jsx
const RegistrarPortal = lazy(() => import('./portals/Registrar/RegistrarPortal'));
const GuardPortal = lazy(() => import('./portals/Guard/GuardPortal'));
// Then wrap with <Suspense fallback={<Loading />}>
```

**Priority:** LOW

---

## Testing & Debugging

### Backend Debugging

**Visual Studio Debugger:**
1. Set breakpoint in `.cs` file
2. `dotnet run` from command line or F5 in VS
3. Request hits breakpoint, pause & inspect variables
4. Step through code (F10 = step over, F11 = step into)

**Console Logging:**
```csharp
Console.WriteLine($"DEBUG: student_id = {student_id}");
```

**Database Verification (SQL*Plus):**
```sql
sqlplus campus_admin/admin123@localhost:1521/XEPDB1
> SELECT * FROM STUDENTS WHERE STUDENT_ID='24-1487';
> SELECT * FROM ENROLLMENTS WHERE STUDENT_ID='24-1487';
```

### Frontend Debugging

**Chrome DevTools (F12):**
1. Network tab: Watch HTTP requests/responses
2. Console tab: Watch for errors & logs
3. React DevTools extension: Inspect component state
4. Sources tab: Set breakpoints in JavaScript

**Console Logging:**
```javascript
console.log('DEBUG: user =', user);
console.error('ERROR:', error.message);
```

### Database Debugging

**SQL*Plus Commands:**
```sql
-- List tables
SELECT table_name FROM user_tables;

-- Count records
SELECT COUNT(*) FROM SECTIONS;

-- Check foreign key constraints
SELECT * FROM user_constraints WHERE table_name='SCHEDULES';

-- Query with joined data
SELECT s.SCHEDULE_ID, s.SUBJECT_CODE, sec.SECTION_NAME, u.FIRST_NAME
  FROM SCHEDULES s
  JOIN SECTIONS sec ON s.SECTION_ID = sec.SECTION_ID
  LEFT JOIN USERS u ON s.PROFESSOR_ID = u.USER_ID
  WHERE sec.SECTION_ID = 'SEC-001';
```

### Testing Workflows

**Faculty Login & Attendance:**
1. Login as `prof-001` / `password`
2. View FacultyDashboard
3. Click a section → ClassAttendance
4. See enrollment list
5. Mark attendance for students

**Registrar Section CRUD:**
1. Login as `registrar1` / `password`
2. Go to Sections tab
3. Create: Click "Add Section", fill form, submit
4. Read: View all sections in table
5. Update: Click section row, edit fields, save
6. Delete: Click delete, confirm

**Registrar Bulk Schedule Import:**
1. Create CSV:
   ```
   Subject_Code,Section_Id,Professor_Id,Room_Id,Time_Start,Time_End,Class_Days,Subject_Type
   DB101,SEC-001,prof-001,IK604,08:00 AM,10:00 AM,Monday/Wednesday,Lec
   ```
2. Go to Schedule Importer
3. Select file
4. Review preview
5. Click Import
6. Verify in database: `SELECT * FROM SCHEDULES WHERE SUBJECT_CODE='DB101';`

**Guard Portal Verification:**
1. Run edge node: `python campus-edge/app.py`
2. Start MQTT broker (if not running)
3. Login as `guard1` / `password`
4. GuardPortal loads
5. Input barcode manually: `24-1487`
6. See face verification result
7. Check EVENT_LOGS in database

---

## Development Checklist

**Before committing code:**
- ✅ Run `npm.cmd run lint` (frontend)
- ✅ Run `npm.cmd run build` (frontend production check)
- ✅ Run `dotnet build campus-backend\campus-backend.csproj` (backend)
- ✅ Test affected workflow end-to-end
- ✅ Verify database queries in SQL*Plus
- ✅ Check browser console for errors (F12)

**When adding a new feature:**
1. Create/update data model in `Models/`
2. Create/update repository interface in `Repositories/IXxxRepository.cs`
3. Implement repository in `Repositories/XxxRepository.cs`
4. Register in `Program.cs` DI container
5. Create/update controller in `Controllers/XxxController.cs`
6. Create/update frontend component in `portals/`
7. Test API endpoint with Postman or frontend form
8. Test database changes in SQL*Plus

---

**Last Updated:** May 11, 2026  
**Documentation Level:** Comprehensive (detailed for vibe coding)  
**Verified:** All 12 API controllers, all 5 portals, all 11 database tables


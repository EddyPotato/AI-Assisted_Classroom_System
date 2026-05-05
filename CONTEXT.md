# AI-Assisted Smart Campus & Classroom System - PROJECT CONTEXT

**Last Updated:** May 5, 2026  
**Project Status:** Development Phase  
**Team:** EddyPotato (Lead)

---

## 📋 PROJECT OVERVIEW

An integrated IoT and web-based platform for university attendance, behavior monitoring, and registrar/HR management using facial recognition and barcode scanning. The system comprises four main components: React/Vite frontend, C# ASP.NET Core backend, Oracle Database, and Python edge node (Raspberry Pi).

**Key Purpose:**
- Real-time attendance tracking via facial recognition
- Behavioral monitoring during class sessions
- Automated HR/Registrar management
- Room allocation & scheduling optimization

---

## 🏗️ ARCHITECTURE & TECH STACK

### Frontend: `campus-dashboard/`
- **Framework:** React 19.2.5 + Vite 8.0.9
- **Styling:** Tailwind CSS 4.2.4
- **Routing:** React Router 7.14.2
- **Icons:** Lucide React 1.8.0
- **Real-time Communication:** Microsoft SignalR 10.0.0
- **Dev Port:** http://localhost:5173

**Key Components Structure:**
```
src/
├── components/
│   ├── auth/          # Login & authentication
│   └── ui/            # Shared UI components (Header, Sidebar, Modals)
├── portals/
│   ├── Faculty/       # Faculty dashboard (attendance logs, room dashboard)
│   ├── Guard/         # Guard portal (door access)
│   ├── Principal/     # Principal operations
│   └── Registrar/     # Core management portal
│       ├── components/
│       │   ├── enrollment/    # Student enrollment & face registration
│       │   ├── faculty/       # Staff/professor management
│       │   ├── schedules/     # Schedule & timetable management
│       │   ├── sections/      # Section & block roster management
│       │   └── users/         # Student directory
│       └── RegistrarPortal.jsx
└── api/               # API integration functions
```

### Backend: `campus-backend/`
- **Framework:** ASP.NET Core 10.0
- **Database ORM:** Oracle.ManagedDataAccess.Core 23.26.200
- **Authentication:** BCrypt.Net-Next 4.1.0
- **Real-time Hub:** SignalR (WebSocket)
- **MQTT Client:** MQTTnet 4.3.7.1207 (LTS v4 - bypasses .NET 10 AOT preview bug)
- **API Port:** http://localhost:5106
- **Base URL for Static Files:** `/ReferenceFaces`

**Controller Structure:**
```
Controllers/
├── AuthController.cs          # Login & authentication
├── EnrollmentsController.cs    # Student enrollment management
├── RoomsController.cs          # Room management
├── SchedulesController.cs      # Schedule CRUD operations
├── SectionsController.cs       # Section management
├── StaffController.cs          # Staff operations
├── StudentController.cs        # Student records
└── UserController.cs           # General user management

Hubs/
└── CampusHub.cs              # SignalR hub for real-time notifications

Services/
└── MqttListenerService.cs    # MQTT listener for edge node events

Repositories/
├── StudentRepository.cs       # Data access layer
├── StaffRepository.cs
├── ScheduleRepository.cs
├── SectionRepository.cs
├── EnrollmentRepository.cs
├── RoomRepository.cs
├── UserRepository.cs
└── [Corresponding Interfaces]
```

### Database: `database/`
- **DBMS:** Oracle Database 21c Express Edition (XE)
- **Connection:** localhost:1521/XEPDB1
- **Schema Owner:** CAMPUS_ADMIN
- **File:** `schema.sql`

**Core Tables:**
- **STUDENTS** - Student records with `FACE_REFERENCE_PATH`
- **STAFF** - Staff/professor records with `FACE_REFERENCE_PATH`
- **USERS** - General user accounts (students, staff, admins)
- **SECTIONS** - Class sections (e.g., "BS-CS-1A")
- **SCHEDULES** - Class schedule assignments (subject, professor, room, time)
- **ENROLLMENTS** - Student-to-section mappings
- **ROOMS** - Physical classroom records
- **EVENT_LOGS** - Attendance & behavior snapshots with timestamps

**Profile Photo Storage:**
- Photos stored in: `campus-backend/ReferenceFaces/`
- Served via: `GET /ReferenceFaces/{filename}`
- Default fallback: Camera icon (when `FACE_REFERENCE_PATH` is null or contains "C:")

### Edge Node: `campus-edge/`
- **Language:** Python 3.10+
- **Vision:** OpenCV 4.9.0.80 + face_recognition 1.3.0
- **QR/Barcode:** pyzbar 0.1.9
- **Communication:** MQTT (paho-mqtt 1.6.1) + HTTP (requests 2.31.0)
- **Environment:** `.env` file (IP address config - NOT version controlled)

**Key Functionality:**
- Real-time camera stream processing
- Facial recognition matching against `FACE_REFERENCE_PATH`
- Barcode/QR scanning for ID verification
- MQTT publishing: `campus/door/scan` (payload: scanned_id)
- Flask API for video stream: `GET /video_feed`

---

## 🎯 CURRENT FEATURES & WORKFLOW

### **Registrar Portal** (Main Hub)
Located at: `src/portals/Registrar/RegistrarPortal.jsx`

**Tabs:**
1. **Schedules Directory** - Global timetable view
   - Filter by room, professor, subject
   - View professor face photos (if available)
   - Shows: Section, Subject Code, Subject Title, Assigned Faculty (with face), Room, Timetable
   - **UI Updated (May 5):** Fixed column spacing with flexbox, added professor face display

2. **Section Directory** - Block section roster management
   - Manage student-section enrollments
   - View: Campus, Course, Year Level, Section Letter, Section Name

3. **Student Directory** - All students in system
   - Search, filter, view profiles
   - Manage face registration & enrollment status

4. **Staff Directory** - Faculty & administrative staff
   - Search, filter by role
   - Soft delete (Inactive), restore, or hard delete
   - View face photos (if registered)

### **Section Roster View** (Nested in Section Directory)
Located at: `src/portals/Registrar/components/sections/SectionRoster.jsx`

**Tabs:**
1. **Student List** (Renamed from "Student Roster" on May 5)
   - Table: Face | Student ID | Last Name | First Name | Action
   - Add/remove students from section
   - View student face photos

2. **Schedules** (Renamed from "Subjects & Faculty" on May 5)
   - Table: Code | Subject Title | Units | Professor (with face photo) | Schedule & Room | Action
   - Assign/edit subjects to section
   - Manage professor assignments & room allocation
   - **UI Updated (May 5):** Fixed column spacing, added professor face photos

---

## 🔧 RECENT CHANGES (May 5, 2026)

### UI/UX Improvements:
1. **Renamed terminology for clarity:**
   - "Student Roster" → "Student List"
   - "Subjects & Faculty" → "Schedules"

2. **Fixed table column spacing:**
   - `MasterScheduleTable.jsx`: Changed fixed widths to flexbox (`flex-1 min-w-max`) for even distribution
   - `SectionRoster.jsx`: Fixed "Schedule & Room" and "Assigned Professor" columns for proper alignment
   - Centered Faculty, Room, and Timetable columns for consistency

3. **Enhanced professor display:**
   - Added professor face photos in schedule tables when `professor_Face_Reference_Path` is available
   - Falls back to UserCircle icon if no photo
   - Cache buster timestamp prevents stale image loads

### Component Status & Observations:
- **`SectionRoster.jsx`** (320 lines): Consolidates Student List and Schedules tabs
  - Current structure: State management, data fetching, filtering, sorting, modals, and two table renderings in single file
  - **Candidate for future refactoring:** Could be decomposed into smaller functional components without changing behavior
  - Main responsibilities: Student enrollment management, subject/schedule assignment, face photo display, sorting/filtering

---

## 📁 FILE STRUCTURE SUMMARY

```
AI-Assisted_Classroom_System/
├── CONTEXT.md                      # This file - AI memory & project manifest
├── README.md                        # Setup & collaboration guide (updated May 5)
├── AI-Assisted_Classroom_System.sln # Visual Studio solution
├── campus-backend/                 # C# ASP.NET Core backend
│   ├── Program.cs                  # Dependency injection & CORS setup
│   ├── campus-backend.csproj       # Project dependencies
│   ├── campus-backend.http         # HTTP request examples (REST testing)
│   ├── Controllers/                # API endpoints
│   ├── Hubs/                       # SignalR real-time communication
│   ├── Models/                     # Data transfer objects (DTOs)
│   ├── Repositories/               # Data access layer (Repository pattern)
│   ├── Services/                   # Business logic services
│   ├── ReferenceFaces/             # Profile photo storage (auto-created)
│   ├── Properties/launchSettings.json
│   ├── appsettings.json            # Backend configuration
│   └── appsettings.Development.json
├── campus-dashboard/               # React Vite frontend
│   ├── package.json                # Dependencies & build scripts
│   ├── vite.config.js              # Vite bundler configuration
│   ├── index.html                  # Entry point
│   ├── src/
│   │   ├── main.jsx                # React root
│   │   ├── App.jsx                 # Routing logic
│   │   ├── components/             # Shared UI components
│   │   └── portals/                # Role-based portals (Faculty, Guard, Principal, Registrar)
│   └── public/                     # Static assets
├── campus-edge/                    # Python edge node (Raspberry Pi)
│   ├── vision_node.py              # Main camera processing script
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # Configuration (IP address - LOCAL ONLY)
└── database/
    └── schema.sql                  # Oracle database DDL
```

---

## 🔐 KEY DECISIONS & CONVENTIONS

### Naming Conventions:
- **Database columns:** SCREAMING_SNAKE_CASE (Oracle SQL)
- **C# properties:** PascalCase (matching Oracle column names for ORM mapping)
- **React component props:** camelCase
- **CSS classes:** Tailwind utility-first (no custom class names except rare cases)
- **File names:** PascalCase for React components, camelCase for utilities

### Data Flow:
1. **Frontend** (React) → **HTTP/SignalR** → **Backend** (ASP.NET Core)
2. **Backend** → **Oracle queries** → **Database**
3. **Edge Node** → **MQTT publish** → **Backend listener** → **Database/Frontend**
4. **Photo serving:** `ReferenceFaces/` folder → Static file middleware → Frontend `<img>` tags

### Profile Photo Handling:
- **Stored as:** Relative file paths in database (e.g., `student_001.jpg`)
- **Served from:** `http://localhost:5106/ReferenceFaces/{filename}`
- **Default:** Camera icon displayed when:
  - `face_Reference_Path` is NULL
  - Path contains "C:" (Windows local path - not uploaded properly)
- **Cache busting:** Query parameter `?t=${timestamp}` prevents stale image loads

### Authentication:
- **Password hashing:** BCrypt.Net-Next
- **Session storage:** Browser localStorage (key: `campus_user`)
- **User object structure:** `{ User_ID, First_Name, Last_Name, Role, Email, ...}`

### CORS & Real-time:
- **CORS Policy:** Allows `http://localhost:5173` (React dev server)
- **SignalR Endpoint:** `ws://localhost:5106/campushub`
- **MQTT Broker:** Expects local MQTT server on `localhost`

---

## ⚙️ ENVIRONMENT SETUP CHECKLIST

### Prerequisites (for all team members):
- [ ] Node.js v18+ (frontend dependencies)
- [ ] .NET 8 SDK (backend compilation)
- [ ] Python 3.10+ (edge node)
- [ ] Oracle Database 21c XE + SQL Developer (local database)
- [ ] Git (version control)

### First-Time Setup:
1. Clone repository
2. Run database schema: `database/schema.sql` in SQL Developer
3. Install frontend dependencies: `cd campus-dashboard && npm install`
4. Restore backend dependencies: `cd campus-backend && dotnet restore`
5. Install Python dependencies: `cd campus-edge && pip install -r requirements.txt`
6. Create `.env` file in `campus-edge/` with `BACKEND_IP=192.168.x.x` (your laptop IP)
7. Start services in order:
   - Backend: `dotnet run` (from `campus-backend/`)
   - Frontend: `npm run dev` (from `campus-dashboard/`)
   - Edge node: `python vision_node.py` (from `campus-edge/`)

### Important Notes:
- **`.env` file:** DO NOT commit (add to `.gitignore`). Each team member creates their own with their IP address.
- **Database:** Each team member runs their own local Oracle XE instance.
- **ReferenceFaces folder:** Auto-created by backend if missing.
- **Hot reload:** Frontend supports HMR; backend needs manual restart.

---

## 🐛 KNOWN ISSUES & WORKAROUNDS

| Issue | Cause | Workaround |
|-------|-------|-----------|
| Professor face not showing | `professor_Face_Reference_Path` null in SCHEDULES | Ensure staff registered with face before assigning to schedule |
| Stale images cached | Browser caching `.jpg` files | Timestamp cache buster already implemented (`?t=${cacheBuster}`) |
| MQTT connection fails | MQTT broker not running | Install mosquitto locally or configure remote broker in code |
| `.NET 10 AOT compilation error` | Preview bug in MQTTnet | Using MQTTnet v4.3.7.1207 LTS (not v5+) |
| Windows path in DB | Face uploaded via local file picker | Validation needed in upload handler to store relative paths only |

---

## 📊 DATA MODEL RELATIONSHIPS

```
USERS (1) ──────────────── (*) ENROLLMENTS
  │                              │
  ├─ STUDENTS (via Role)        └─ (*) SECTIONS
  │   └─ face_Reference_Path        │
  │                                 └─ (*) SCHEDULES
  │                                     ├─ professor_ID (FK → STAFF)
  ├─ STAFF (via Role)                  ├─ room_ID (FK → ROOMS)
  │   └─ face_Reference_Path          └─ subject_Code
  │
  └─ Events: EVENT_LOGS (FK: student_ID, professor_ID)
```

---

## 🚀 NEXT STEPS (When Continuing)

1. **Refactor `SectionRoster.jsx` (320 lines)**
   - **Why:** Component currently handles multiple concerns in one file
   - **How:** Decompose into functional subcomponents:
     - `StudentListTab.jsx` - Student enrollment table & management
     - `SchedulesTab.jsx` - Subject/schedule table & assignment
     - `useEnrollmentLogic.js` - Custom hook for student add/remove/fetch logic
     - `useScheduleLogic.js` - Custom hook for schedule fetch/edit/delete/sort logic
     - Keep parent component lightweight for tab switching & modal coordination
   - **Benefit:** Improved code maintainability, easier to test individual features, reduced cognitive load per file

2. **Implement role-based access control (RBAC)** - Currently basic role checking
3. **Add face verification workflow** - Currently only storage, not matching
4. **Complete Guard & Principal portals** - Stubs exist, need UI/logic
5. **Add batch import** - CSV upload for students/staff/schedules
6. **Implement attendance reporting** - Based on EVENT_LOGS data
7. **Add notification system** - Via SignalR to push alerts
8. **Optimize image storage** - Consider cloud storage (Azure Blob, AWS S3)
9. **Add audit logging** - Track all data modifications

---

## 📞 TROUBLESHOOTING GUIDE

### "Cannot connect to backend"
- Check if backend is running: `dotnet run` from `campus-backend/`
- Verify port 5106 is not in use
- Check CORS policy in `Program.cs`

### "Database connection fails"
- Ensure Oracle XE is running
- Check `appsettings.json` for correct connection string
- Verify user has schema creation permissions

### "Face photos not loading"
- Check `ReferenceFaces/` folder exists and contains images
- Verify file extensions match database entries (e.g., `.jpg` not `.JPG`)
- Check browser console for 404 errors on image requests

### "SignalR connection fails"
- Ensure backend is running and listening
- Check firewall isn't blocking port 5106
- Verify correct endpoint in React: `"http://localhost:5106/campushub"`

---

**For questions or updates to this CONTEXT.md, ensure all team members are notified of changes.**

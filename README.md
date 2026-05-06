# AI-Assisted Smart Campus & Classroom System

---

## 📊 Project Status (May 6, 2026)

**Current Phase:** Guard Portal Phase 1 Complete → **Phase 2: Real-Time Access Control Enhancements**

**Phase 1 Completions (Prototype):**
- ✅ **Guard Portal Framework** - Camera feed viewer + access log
- ✅ **Barcode/QR Scanning** - pyzbar integration with MQTT
- ✅ **Real-Time Face Verification** - SignalR updates to UI
- ✅ **Section Management CRUD** - Create, Edit, Delete operations with cascading deletes
  - `POST /api/sections` - Create new section
  - `PUT /api/sections/{id}` - Update section details
  - `DELETE /api/sections/{id}` - Delete section (removes enrollments, schedules, section)
- ✅ Enhanced `SectionDTO` with Campus and Section_Letter fields
- ✅ Table column spacing fixes (Schedules & Faculty views)
- ✅ Professor face photo display with fallback icons
- ✅ Cache-busting for profile images

**Phase 2 In Planning (See [NEXT_GOALS.md](./NEXT_GOALS.md) for Complete Roadmap):**
- 🔄 **Camera Control System** - Off/On buttons (no auto-close on logout)
- 🔄 **Manual ID Input** - Fallback text input for missing barcodes
- 🔄 **Camera Location Configuration** - Support multiple cameras (entrance/exit/room-specific)
- 🔄 **Privacy-Enhanced Event Logging** - Separate Access History tab (hidden from main UI)
- 🔄 **Manual Bypass Feature** - For students/staff without ID cards
- 🔄 **Controlled Environment Testing** - Room-based attendance scenarios (e.g., IL604)
- 🔄 **Python Script Stability** - Investigate/fix unexpected shutdowns

**Planned (Phase 3+):**
- Component refactoring (SectionRoster.jsx decomposition)
- Complete CRUD for Schedules and Rooms
- RBAC implementation
- Professor bypass & verification system
- Auto-start vision_node.py when opening Guard Portal
- Room-based attendance tracking
- Advanced analytics & occupancy monitoring

---

## 🚔 **Guard Portal: Real-Time Face Recognition Access System**

### The AI Magic Behind the Scenes

The Guard Portal bridges **hardware (Raspberry Pi + camera)**, **AI (face recognition)**, and **real-time web dashboard** to create an instant access control system.

#### **Face Recognition Technology Stack**
- **Library:** `face_recognition` v1.3.0 + OpenCV
- **Detection:** HOG (Histogram of Oriented Gradients) to locate faces
- **Encoding:** Pre-trained ResNet deep learning model (via dlib) generates 128-dimensional face map
- **Comparison:** Live camera face vs. student's `FACE_REFERENCE_PATH` — threshold distance 0.6 = **99.38% accuracy**
- **Speed:** ~200ms per frame (real-time performance)

#### **Guard Portal Workflow: 2-Phase System**

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: BARCODE/QR SCAN (Student ID Verification)        │
├─────────────────────────────────────────────────────────────┤
│ 1. Student holds barcode/QR to camera                       │
│ 2. Python edge node (pyzbar library) reads barcode          │
│ 3. MQTT message sent: campus/door/scan → { student_id }    │
│ 4. C# backend receives & looks up student record            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: FACE RECOGNITION (Biometric Match)               │
├─────────────────────────────────────────────────────────────┤
│ 1. Edge node retrieves student's FACE_REFERENCE_PATH       │
│ 2. Compares 128D face encoding from DB vs. live video      │
│ 3. If distance < 0.6: ✅ MATCH FOUND                       │
│ 4. MQTT message: campus/door/verified → { status }        │
│ 5. C# backend logs event to EVENT_LOGS table               │
│ 6. SignalR (WebSocket) pushes result to React Guard UI     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ UI UPDATE: Guard sees real-time result (no page refresh)   │
├─────────────────────────────────────────────────────────────┤
│ ✅ Green: "John Doe (ID: STU001) - GATE UNLOCKED"          │
│ ❌ Red: "Face mismatch - DENIED"                           │
│ ⏱️ Access log updates instantly with timestamp             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Guard Portal UI Components (Current Phase 1)

**Left Panel: Camera Feed**
- Live MJPEG stream from edge node: `http://localhost:5000/video_feed`
- Real-time status badge: LIVE | SIGNAL LOST
- Camera identifier: CAM_01: MAIN GATE
- *Phase 2: Will add Start/Stop camera buttons and location selector*

**Right Panel: Access Log**
- Real-time scan events from SignalR
- Show: Student Photo | Name | ID | Status (✅/❌) | Timestamp
- Filter/sort options: All | Approved | Denied | Today | This Week
- *Phase 2: Limited to last 10 entries; full history in separate tab*

**Bottom Controls**
- **MANUAL BYPASS (FORGOTTEN ID):** Manual override for students without barcode
  - *Phase 2: Improved with confirmation dialog and location tracking*
- **TRIGGER LOCKDOWN:** Emergency security lockdown
  - *Phase 2: Removed (inappropriate for access control)*

**Phase 2 New Components:**
- Camera location selector (Entrance/Exit/Room)
- Manual ID text input form
- Offline/Online camera status indicator
- Access History tab (separate from main view)

### Integration Points

| Component | Connection | Purpose |
|-----------|-----------|---------|
| Python Edge Node | MQTT `campus/door/scan` | Sends barcode data & face match status |
| C# Backend | MQTT Listener Service | Receives edge events → logs to DB |
| SignalR Hub | `CampusHub.cs` | Broadcasts results to Guard UI in real-time |
| React Frontend | SignalR client | Receives events → updates access log |
| Oracle DB | EVENT_LOGS table | Stores attendance & access records |

---

## 🔧 **Guard Portal Phase 2: Upcoming Improvements**

See [NEXT_GOALS.md](./NEXT_GOALS.md) for complete development roadmap.

### Key Enhancements

| Feature | Current | Upcoming | Benefit |
|---------|---------|----------|---------|
| **Camera Control** | Auto-closes with logout | On/Off button | Manual control, prevents unexpected stops |
| **ID Entry** | Barcode only | + Manual text input | Backup for missing/damaged barcodes |
| **Camera Locations** | Hardcoded "Main Gate" | Configurable (entrance/exit/rooms) | Multi-gate support + room attendance |
| **Event Logs** | Visible in main UI | Separate Access History tab | Privacy protection, cleaner interface |
| **Manual Bypass** | Button present | Improved with confirmation | For students without ID cards |
| **Lockdown Button** | Present | Removed | Inappropriate for access control |
| **Verification Display** | Small profile pic | Large profile pic + better layout | Better UX, clearer verification status |

### Use Case: Room-Based Attendance Tracking

Example scenario - IL604 classroom, SE101 class (2:30 PM - 5:30 PM):

```
📍 Set Camera Location: IL604 Classroom
📅 Check Schedule: SE101 (Professor + Students)
🚪 Student arrives 5 min early → scans barcode at IL604 camera
  ✓ Status: "present-in-room"
  ✓ Logged: "Student entered IL604"
📍 After class (5 minutes manual test)
🚪 Student re-scans → exits IL604
  ✓ Status: Returns to "in-campus"
  ✓ Logged: "Student exited IL604"
📊 Attendance automatically tracked for IL604
```

### Privacy-First Event Logging

**Main Guard Portal:**
- Shows only last 10 access log entries
- Displays: Name, ID, Status, Timestamp, Location
- No detailed scan history

**Separate Access History Tab:**
- Full event logs with filtering
- Date range, student, location filters
- For authorized personnel only (future RBAC)

---

## 👥 Team Collaboration Guide

This repository does **not** include heavy dependencies like `node_modules` or `.dll` files. When you clone this project for the first time, you must install the dependencies for each module locally by following the steps below.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:

| Component | Version | Purpose | Download |
|-----------|---------|---------|----------|
| **Node.js** | v18+ | React frontend package management | [nodejs.org](https://nodejs.org/) |
| **.NET SDK** | 8.0+ | C# backend compilation | [dotnet.microsoft.com](https://dotnet.microsoft.com/download) |
| **Python** | 3.10+ | Edge node (Raspberry Pi) vision processing | [python.org](https://www.python.org/downloads/) |
| **Oracle Database 21c XE** | Latest | Local database instance | [oracle.com/xe](https://www.oracle.com/database/technologies/xe-downloads.html) |
| **Oracle SQL Developer** | Latest | Database management tool | [oracle.com/sqldev](https://www.oracle.com/database/sqldeveloper/download/) |
| **Git** | Latest | Version control | [git-scm.com](https://git-scm.com/) |

---

## 🚀 Quick Start Installation

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/EddyPotato/AI-Assisted_Classroom_System.git
cd AI-Assisted_Classroom_System
```

---

### **Step 2: Database Setup (Oracle)**

Since we use local databases, each team member must create the tables on their machine.

#### **Option A: Using SQL Developer (Recommended for Beginners)**

1. **Open Oracle SQL Developer** and connect to your local XE database
   - Connection Name: `Local XE`
   - Username: `sys` (or `system`)
   - Password: (your XE password)
   - Hostname: `localhost`
   - Port: `1521`
   - Service Name: `XEPDB1`
   - Click **Connect**

2. **Open and run the database schema:**
   - File → Open → Navigate to `database/schema.sql`
   - Select all the code (Ctrl+A)
   - Run (Ctrl+Enter or F9)

3. **Verify tables were created:**
   ```sql
   SELECT table_name FROM user_tables WHERE owner = 'CAMPUS_ADMIN';
   ```
   You should see: `STUDENTS`, `STAFF`, `USERS`, `SECTIONS`, `SCHEDULES`, `ROOMS`, `ENROLLMENTS`, `EVENT_LOGS`

#### **Option B: Using Command Line (Advanced)**

```bash
# Connect to Oracle
sqlplus sys@localhost:1521/XEPDB1 as sysdba

# Run the schema file
@database/schema.sql

# Verify
SELECT table_name FROM user_tables WHERE owner = 'CAMPUS_ADMIN';

# Exit
EXIT;
```

---

### **Step 3: Backend Setup (.NET Core)**

```bash
# Navigate to backend directory
cd campus-backend

# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Check if build was successful
# You should see: "Build succeeded"

# Go back to root
cd ..
```

**Note:** The backend is configured to:
- Auto-create the `ReferenceFaces/` folder for profile photos
- Connect to Oracle at: `localhost:1521/XEPDB1`
- Listen on: `http://localhost:5106`
- CORS allows: `http://localhost:5173` (frontend)

---

### **Step 4: Frontend Setup (React)**

```bash
# Navigate to frontend directory
cd campus-dashboard

# Install dependencies
npm install

# Verify installation
npm list react

# Go back to root
cd ..
```

---

### **Step 5: Edge Node Setup (Python)**

```bash
# Navigate to edge directory
cd campus-edge

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
pip list

# Go back to root
cd ..
```

#### **Create `.env` File (Local Configuration)**

Each team member must create their own `.env` file with their local IP address:

```bash
# In campus-edge/ directory, create a new file named: .env

# Add this line (replace with YOUR laptop IP):
BACKEND_IP=192.168.x.x
```

**How to find your IP:**
- Windows: Open CMD and type `ipconfig` → Look for "IPv4 Address"
- macOS/Linux: Open Terminal and type `ifconfig` → Look for "inet"

**IMPORTANT:** The `.env` file is already in `.gitignore` — do NOT commit it! Each team member creates their own.

---

## 🏃 Running the Application

You'll need **3 terminal windows** to run all services simultaneously.

### **Terminal 1: Start Backend (ASP.NET Core)**

```bash
cd campus-backend
dotnet run
```

Expected output:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5106
```

### **Terminal 2: Start Frontend (React)**

```bash
cd campus-dashboard
npm run dev
```

Expected output:
```
  VITE v8.0.9  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### **Terminal 3: Start Edge Node (Python)**

```bash
cd campus-edge

# Activate virtual environment first (if not already active)
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

python vision_node.py
```

Expected output:
```
 * Running on http://0.0.0.0:5000
 * Press CTRL+C to quit
```

---

## 🎯 Accessing the Application

Once all services are running:

1. **Open your browser** and navigate to: `http://localhost:5173`
2. **Login** with a test user account (see database setup notes)
3. **Navigate** to different portals:
   - **Registrar Portal:** Manage schedules, sections, students, staff
   - **Faculty Portal:** View attendance logs
   - **Guard Portal:** Door access control
   - **Principal Portal:** System overview

---

## 🗂️ Project Structure Overview

```
AI-Assisted_Classroom_System/
├── CONTEXT.md                    # AI memory & project manifest (READ FIRST)
├── README.md                     # This file
├── campus-backend/               # C# ASP.NET Core API
│   ├── Controllers/              # API endpoints
│   ├── Repositories/             # Database layer
│   ├── Models/                   # Data models
│   ├── Services/                 # Business logic
│   ├── Program.cs                # App configuration
│   └── campus-backend.csproj     # Dependencies
├── campus-dashboard/             # React Vite frontend
│   ├── src/
│   │   ├── portals/              # Role-based dashboards (Registrar, Faculty, etc.)
│   │   ├── components/           # Shared UI components
│   │   └── App.jsx               # Main routing
│   ├── package.json              # Dependencies
│   └── vite.config.js            # Build configuration
├── campus-edge/                  # Python edge node (Raspberry Pi)
│   ├── vision_node.py            # Main camera processing script
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Local IP config (DO NOT COMMIT)
└── database/
    └── schema.sql                # Oracle database schema
```

---

## 📝 Key Development Notes

### Naming Conventions

| Category | Style | Example |
|----------|-------|---------|
| Database columns | SCREAMING_SNAKE_CASE | `FACE_REFERENCE_PATH` |
| C# class properties | PascalCase | `FirstName`, `LastName` |
| React components | PascalCase | `StaffTable`, `SectionRoster` |
| React files | PascalCase | `StudentTable.jsx` |
| React hooks/utils | camelCase | `useStudents()`, `fetchData()` |
| CSS classes | Tailwind utility | `p-4`, `text-slate-800` |

### Database Connection String

```
User Id=CAMPUS_ADMIN;
Password=yourpassword;
Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=XEPDB1)));
```

Configured in: `campus-backend/appsettings.json`

### API Base URL & Endpoints

All API calls use: `http://localhost:5106/api/`

#### **Section Management** (Fully Implemented)
```
GET    /api/sections                 # Get all sections
POST   /api/sections                 # Create new section
PUT    /api/sections/{id}            # Update section details
DELETE /api/sections/{id}            # Delete section (cascades cleanup)
GET    /api/sections/{id}/students   # Get students in section
POST   /api/sections/{id}/students   # Add students to section
DELETE /api/sections/{id}/students/{studentId}  # Remove student
GET    /api/sections/{id}/schedule   # Get section schedule
```

#### **Other Endpoints**
```
GET    /api/student                  # Get all students
GET    /api/schedules                # Get all schedules
POST   /api/enrollments              # Create enrollment
GET    /api/staff                    # Get all staff
GET    /api/rooms                    # Get all rooms
```

**Request/Response Examples:**

Create Section:
```json
POST /api/sections
{
  "section_Name": "SBIT2A",
  "course": "IT",
  "year_Level": 2,
  "campus": "SB",
  "section_Letter": "A"
}
```

Update Section:
```json
PUT /api/sections/SEC-001
{
  "section_Name": "SBIT2A",
  "course": "IT",
  "year_Level": 2,
  "campus": "SB",
  "section_Letter": "A"
}
```

### Frontend Authentication

User data stored in browser localStorage:
```javascript
// Example structure
{
  User_ID: "USR001",
  First_Name: "John",
  Last_Name: "Doe",
  Role: "Registrar",
  Email: "john@campus.edu"
}
```

### SignalR Real-Time Communication (Guard Portal)

The Guard Portal uses SignalR WebSockets for real-time access log updates. Integration template:

```javascript
// In GuardPortal.jsx
import { HubConnectionBuilder } from "@microsoft/signalr";
import { useEffect, useState } from "react";

export default function GuardPortal() {
  const [accessLog, setAccessLog] = useState([]);
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    // Connect to SignalR hub
    const newConnection = new HubConnectionBuilder()
      .withUrl("http://localhost:5106/campushub")
      .withAutomaticReconnect()
      .build();

    newConnection.start()
      .then(() => console.log("SignalR connected"))
      .catch(err => console.error("Connection failed:", err));

    // Listen for scan results from backend
    newConnection.on("ReceiveScanResult", (data) => {
      // data structure: { student_id, first_name, last_name, status, timestamp, face_path }
      setAccessLog(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 entries
    });

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, []);

  return (
    // ... existing JSX
    <div className="p-4 flex-1 overflow-y-auto space-y-3">
      {accessLog.length === 0 ? (
        <div className="text-center text-slate-600 font-bold mt-10">Awaiting gate scans...</div>
      ) : (
        accessLog.map((entry, idx) => (
          <div key={idx} className={`p-3 rounded-lg ${entry.status === 'approved' ? 'bg-emerald-900/40' : 'bg-rose-900/40'}`}>
            <div className="flex items-center gap-3">
              {entry.face_path ? (
                <img src={`http://localhost:5106/ReferenceFaces/${entry.face_path}`} alt={entry.first_name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">?</div>
              )}
              <div className="flex-1">
                <p className="font-bold text-white">{entry.first_name} {entry.last_name}</p>
                <p className="text-xs text-slate-400">{entry.student_id}</p>
              </div>
              <span className={`text-xs font-black px-2 py-1 rounded ${entry.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'}`}>
                {entry.status === 'approved' ? '✅ APPROVED' : '❌ DENIED'}
              </span>
              <span className="text-xs text-slate-400">{entry.timestamp}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
```

**Backend SignalR Hub** (`campus-backend/Hubs/CampusHub.cs`) already has the `Clients.All.SendAsync("ReceiveScanResult", data)` broadcast ready. MQTT listener service will trigger this on barcode scan events.

---

## 🔧 Troubleshooting

### "Cannot connect to backend"
- ✅ Verify backend is running: `dotnet run` in `campus-backend/`
- ✅ Check port 5106 is not in use
- ✅ Restart backend and refresh browser

### "Database connection fails"
- ✅ Verify Oracle XE is running
- ✅ Check connection string in `appsettings.json`
- ✅ Ensure `schema.sql` was executed successfully
- ✅ Verify tables exist: `SELECT * FROM user_tables;` in SQL Developer

### "npm install fails"
- ✅ Clear cache: `npm cache clean --force`
- ✅ Delete `node_modules` and `package-lock.json`
- ✅ Reinstall: `npm install`
- ✅ Ensure Node.js version is 18+

### "Python dependencies fail to install"
- ✅ Ensure virtual environment is activated
- ✅ Check Python version: `python --version`
- ✅ Update pip: `python -m pip install --upgrade pip`
- ✅ Install with: `pip install -r requirements.txt --upgrade`

### "Face photos not showing"
- ✅ Check `ReferenceFaces/` folder exists
- ✅ Verify image files are in the folder
- ✅ Check browser console for 404 errors
- ✅ Ensure database has correct file paths

---

## 📚 Additional Resources

### Code Documentation
- **CONTEXT.md:** High-level project architecture & design decisions
- **CAMPUS.md** (if exists): API documentation
- **Controllers:** Inline comments explain complex logic

### Component Status & Refactoring Plan
- **`SectionRoster.jsx` (320 lines):** Currently consolidates Student List and Schedules management
  - Monitor file size if more features added
  - Planned decomposition (see CONTEXT.md NEXT STEPS) would split into subcomponents without changing functionality

### Common Tasks

**How to add a new feature:**
1. Read `CONTEXT.md` for architecture overview
2. Check relevant controller in `campus-backend/Controllers/`
3. Update React component in `campus-dashboard/src/portals/Registrar/`
4. Test with API calls via `campus-backend.http`

**How to debug API issues:**
1. Open `campus-backend.http` in VS Code
2. Use **REST Client** extension (if installed)
3. Test endpoints directly

**How to check database:**
1. Open SQL Developer
2. Connect to local XE
3. Open SQL Worksheet
4. Query tables directly

---

## 🚨 Important Before Committing

1. **DO NOT commit:**
   - `node_modules/` (frontend)
   - `bin/` and `obj/` (backend)
   - `.env` file (Python local config)
   - `campus-edge/.env` with your IP address

2. **DO commit:**
   - `database/schema.sql` (required for others)
   - `package.json` & `package-lock.json`
   - `.csproj` files
   - `requirements.txt`
   - Source code only (`.cs`, `.jsx`, `.py`)

3. **Before pushing:**
   ```bash
   git status
   # Make sure ONLY your code changes are staged
   # DO NOT include node_modules, bin, obj, .env
   ```

---

## 💡 Tips for Collaboration

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Keep CONTEXT.md updated:**
   - If you change architecture, update CONTEXT.md
   - This helps future team members understand decisions

3. **Test locally before pushing:**
   - Run all 3 services
   - Test your changes thoroughly
   - Check for errors in browser console

4. **Document your changes:**
   - Clear commit messages
   - Add comments to complex code

---

## 📞 Support & Questions

If you encounter issues:
1. Check this README for troubleshooting
2. Review CONTEXT.md for architecture decisions
3. Check existing GitHub issues
4. Ask team leads

---

## 📜 License & Credits

**Team:** EddyPotato (Lead Developer)  
**Last Updated:** May 5, 2026  
**Status:** Development Phase

---

**Happy coding! 🚀 If you have any setup issues, please reach out to the team lead.**
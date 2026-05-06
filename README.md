# AI-Assisted Smart Campus & Classroom System

---

## 📊 Project Status (May 6, 2026)

**Current Phase:** Backend CRUD Complete, Frontend Integration & UI Polish

**Recent Completions:**
- ✅ **Section Management CRUD** - Create, Edit, Delete operations with cascading deletes
  - `POST /api/sections` - Create new section
  - `PUT /api/sections/{id}` - Update section details
  - `DELETE /api/sections/{id}` - Delete section (removes enrollments, schedules, section)
- ✅ Enhanced `SectionDTO` with Campus and Section_Letter fields
- ✅ Table column spacing fixes (Schedules & Faculty views)
- ✅ Professor face photo display with fallback icons
- ✅ Cache-busting for profile images

**In Progress:**
- 🔄 Frontend integration for new section endpoints
- 🔄 UI implementation for section create/edit/delete modals

**Planned (Next Phase):**
- Component refactoring (SectionRoster.jsx decomposition)
- Complete CRUD for Schedules and Rooms
- RBAC implementation
- Face verification workflow

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
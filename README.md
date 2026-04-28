This is a very common challenge when transitioning from a solo project to a team project! Putting your `node_modules` and compiled files in `.gitignore` was the exact right move. 

To answer your biggest question first regarding the **Oracle Database**: Collaborating on a local database (like Oracle 21c XE on your desktop) is notoriously difficult for student teams because everyone has to install a heavy database engine and keep their tables perfectly synced. 

**Here are your two best options for database collaboration:**

* **Option 1: The "Init Script" Approach (Immediate & Free but requires manual syncing):** You export all your table creations (`CREATE TABLE...`) and initial data (`INSERT INTO...`) from your Oracle SQL Developer into a single file named `schema.sql`. You put this file inside a new folder in your repo called `database/`. Your groupmates install Oracle 21c XE on their laptops, run your `schema.sql` file once, and their local database will perfectly match yours.
* **Option 2: The Cloud Approach (Highly Recommended for Teams):** Since you are already writing Oracle C# code, you can sign up for the **Oracle Cloud "Always Free" Tier**. They give you a free, hosted Autonomous Database. You run your tables there, update your `appsettings.json` connection string to point to the cloud URL, and suddenly your whole team shares the exact same live database automatically. Nobody has to install Oracle locally! *(Note: Since you also have experience with Supabase, you could migrate your C# backend to PostgreSQL/Supabase, but staying with Oracle Cloud requires zero code changes right now).*

For now, I have structured the `README.md` using the **Init Script (Option 1)** approach, assuming your team will use local databases for the moment. You can create a `database/schema.sql` file and push it to GitHub alongside this README.

Here is the complete, professional `README.md` you can copy and paste into your repository. It includes exact setup commands for your specific Vite, C#, and Python architecture.

***

```markdown
# AI-Assisted Smart Campus & Classroom System

An integrated IoT and web-based platform for university attendance, behavior monitoring, and registrar/HR management. This system utilizes a React/Vite frontend, a C# ASP.NET Core backend, an Oracle Database, and a Python-based edge node (Raspberry Pi) for facial recognition and barcode scanning.

## 👥 Team Collaboration Guide

This repository does **not** include heavy dependencies like `node_modules` or `.dll` files. When you clone this project for the first time, you must install the dependencies for each module locally by following the steps below.

### Prerequisites
Before starting, ensure you have the following installed on your machine:
* **[Node.js](https://nodejs.org/)** (v18+ recommended) - For the React frontend.
* **[.NET 8 SDK](https://dotnet.microsoft.com/download)** - For the C# backend.
* **[Python 3.10+](https://www.python.org/downloads/)** - For the Edge AI vision node.
* **[Oracle Database 21c Express Edition (XE)](https://www.oracle.com/database/technologies/xe-downloads.html)** & **SQL Developer** - For the local database.

---

## 🚀 Quick Start Installation

### Step 1: Clone the Repository
```bash
git clone [https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git](https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git)
cd YOUR-REPO-NAME
```

### Step 2: Database Setup (Oracle)
Since we are using local databases, you need to create the tables on your machine so your backend doesn't crash.
1. Open Oracle SQL Developer and connect to your local XE database (usually `localhost:1521/XEPDB1`).
2. Open the `database/schema.sql` file located in this repository.
3. Run the entire script to generate the `USERS`, `STUDENTS`, `SCHEDULES`, and `ROOMS` tables and insert the default administrative data.

### Step 3: Backend Setup (C# ASP.NET Core)
The backend handles our API endpoints and Oracle database connections.
```bash
# Navigate to the backend directory
cd campus-backend

# Restore all NuGet packages and dependencies
dotnet restore

# Run the server (Defaults to http://localhost:5106)
dotnet run
```
*Note: If your local Oracle database has a different password than the default, update the `OracleConnection` string inside `campus-backend/appsettings.json` before running the server.*

### Step 4: Frontend Setup (React + Vite + Tailwind CSS)
The dashboard uses a modern React 19+ and Tailwind CSS setup. Open a **new terminal window** and run:
```bash
# Navigate to the frontend directory
cd campus-dashboard

# Install all Node modules and packages
npm install

# Start the Vite development server
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

### Step 5: Edge Node Setup (Python IoT)
The Python node handles the camera hardware and MQTT communications. Open a **third terminal window**:
```bash
# Navigate to the edge node directory
cd campus-edge

# Create a virtual environment (recommended)
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install required Python packages (OpenCV, Paho-MQTT, etc.)
pip install -r requirements.txt

# Run the vision node
python vision_node.py
```

---

## 📁 Project Structure

* `/campus-dashboard/` - The React/Vite frontend UI (Registrar, HR, Principal, Guard portals).
* `/campus-backend/` - The C# ASP.NET Core REST API.
* `/campus-edge/` - Python scripts for the Raspberry Pi 5 camera hardware.
* `/database/` - SQL scripts to initialize and sync the Oracle database across team members.

## 🛠️ Typical Git Workflow for the Team
To prevent overriding each other's code, please follow this workflow:
1. Before starting work, always pull the latest changes: `git pull origin main`
2. Create a new branch for your feature: `git checkout -b feature-your-feature-name`
3. Commit your changes: `git commit -m "Added new scheduling feature"`
4. Push to your branch: `git push origin feature-your-feature-name`
5. Create a Pull Request (PR) on GitHub to merge into `main`.
```

***

### Your Next Action:
To make this work flawlessly for your group, you should open your Oracle SQL Developer, right-click on your tables, select **Export**, choose to export the DDL (the CREATE statements) and the Data (the INSERT statements), save it as `schema.sql`, and push it into a `database` folder in your GitHub repo!

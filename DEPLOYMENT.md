# 🚀 AI-Assisted Classroom System: Deployment Guide

This guide allows anyone to download, configure, and run the campus system with a single click, regardless of the operating system.

## Phase 1: Database Initialization
Before running the system, the host machine must have the database server running.

**For Windows (Oracle):**
1. Ensure Oracle Database XE is installed and running.
2. Open Oracle SQL Developer.
3. Connect as the `SYSTEM` user and create the workspace: 
   `CREATE USER campus_admin IDENTIFIED BY admin123;`
   `GRANT ALL PRIVILEGES TO campus_admin;`
4. Connect as `campus_admin` and run the `database/schema.sql` script to build the tables.

**For Linux / Raspberry Pi 5 (MariaDB):**
*No manual database setup is required. The Linux launcher will automatically translate the Oracle schema, install MariaDB, and build the database upon execution.*

## Phase 2: System Installation
1. Open a terminal (Command Prompt on Windows, Terminal on Linux).
2. Download the system from GitHub:
   `git clone https://github.com/EddyPotato/AI-Assisted_Classroom_System.git`
3. Enter the project folder:
   `cd AI-Assisted_Classroom_System`

## Phase 3: The 1-Click Boot Sequence
The system features an OS-Aware orchestrator. It will automatically detect your operating system, install necessary dependencies (Node.js modules, Python libraries, .NET builds), and configure the codebase to match your hardware.

**For Windows Laptops/Desktops:**
1. Double-click the **`start_windows.bat`** file inside the folder.
2. Three terminal windows will appear. **Do not close them.** 3. Open your web browser and go to: `http://localhost:5173`

**For Linux / Raspberry Pi 5:**
1. Open the terminal inside the project folder.
2. Make the launcher runnable: `chmod +x start_linux.sh`
3. Run the launcher: `./start_linux.sh`
4. Open your web browser and go to: `http://localhost:5173`

## Phase 4: System Shutdown & Updates
* **To shut down:** Close the browser and close the black terminal windows (or press `CTRL+C` on Linux). 
* **To update:** Open a terminal in the folder, type `git pull origin main`, and run your launcher script again. The system will automatically adapt to any new changes.
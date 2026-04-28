Haha, let me clear this up fast so you can go to work!

To answer your two questions:

The Oracle Database: YES! You just export your tables as a .sql file, put it in a folder named database inside your project, and push it to GitHub. Your groupmates will download it and run it in their own local Oracle SQL Developer.

The .env file: Do NOT delete it, but you should add .env to your .gitignore file! The .env file holds your personal laptop's IP address. Your groupmates will create their own .env file on their own laptops. I have updated the README below to tell them exactly how to do that!

Here is the complete, final README.md for your GitHub repository. Copy and paste everything inside the box below!

Markdown
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
Step 2: Database Setup (Oracle)
Since we are using local databases, you need to create the tables on your machine so your backend doesn't crash.

Open Oracle SQL Developer and connect to your local XE database (usually localhost:1521/XEPDB1).

Open the database/schema.sql file located in this repository.

Run the entire script to generate the USERS, STUDENTS, SCHEDULES, and ROOMS tables and insert the default administrative data.

Step 3: Backend Setup (C# ASP.NET Core)
The backend handles our API endpoints and Oracle database connections.

Bash
# Navigate to the backend directory
cd campus-backend

# Restore all NuGet packages and dependencies
dotnet restore

# Run the server (Defaults to http://localhost:5106)
dotnet run
Note: If your local Oracle database has a different password than the default admin123, update the OracleConnection string inside campus-backend/appsettings.json before running the server.

Step 4: Frontend Setup (React + Vite + Tailwind CSS)
The dashboard uses a modern React 19+ and Tailwind CSS setup. Open a new terminal window and run:

Bash
# Navigate to the frontend directory
cd campus-dashboard

# Install all Node modules and packages
npm install

# Start the Vite development server
npm run dev
The dashboard will be available at http://localhost:5173.

Step 5: Edge Node Setup (Python IoT)
The Python node handles the camera hardware and MQTT communications. Open a third terminal window:

Bash
# Navigate to the edge node directory
cd campus-edge

# Create a virtual environment (recommended)
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install required Python packages
pip install -r requirements.txt
⚠️ Important Python Environment Step:
You must create a .env file inside the campus-edge folder. This tells the Python script where your C# server is located. Create the file and add this code, changing the IP address to match your laptop's IPv4 address:

Ini, TOML
BACKEND_API_URL=http://YOUR_LAPTOP_IP:5106/api
MQTT_BROKER_IP=YOUR_LAPTOP_IP
MQTT_PORT=1883
ROOM_ID=RM-101
Once the .env is created, you can run the camera script:

Bash
python vision_node.py
📁 Project Structure
/campus-dashboard/ - The React/Vite frontend UI (Registrar, HR, Principal, Guard portals).

/campus-backend/ - The C# ASP.NET Core REST API.

/campus-edge/ - Python scripts for the Raspberry Pi 5 camera hardware.

/database/ - SQL scripts to initialize and sync the Oracle database across team members.

🛠️ Typical Git Workflow for the Team
To prevent overriding each other's code, please follow this workflow:

Before starting work, always pull the latest changes: git pull origin main

Create a new branch for your feature: git checkout -b feature-your-feature-name

Commit your changes: git commit -m "Added new scheduling feature"

Push to your branch: git push origin feature-your-feature-name

Create a Pull Request (PR) on GitHub to merge into main.
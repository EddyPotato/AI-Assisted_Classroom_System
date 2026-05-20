#!/bin/bash
# File: start_linux.sh
# Version: v2.2
# Changes: Fixed sudo password prompts, added MySQL health checks, improved dependency handling.

echo "==================================================="
echo "Booting Linux Environment"
echo "==================================================="

# OS Check
if [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "cygwin"* || "$OSTYPE" == "win32"* ]]; then
    echo "[ERROR] Windows OS detected."
    echo "Please close this terminal and double-click 'start_windows.bat' instead."
    exit 1
fi

# 1. Execute the Forward Mutator
python3 scripts/make_linux_compatible.py

# 2. FIX: Check if MariaDB is running before attempting to seed
if [ -f "database/schema_mariadb.sql" ]; then
    echo "[WAIT] Checking MariaDB service..."
    
    # Check if MySQL daemon is running
    if ! pgrep -x "mysqld" > /dev/null; then
        echo "[WARNING] MariaDB/MySQL daemon is not running."
        echo "[INFO] Attempting to start MariaDB service..."
        # Try to start MariaDB (may require sudo password)
        if sudo systemctl start mysql 2>/dev/null || sudo service mysql start 2>/dev/null; then
            echo "[SUCCESS] MariaDB service started."
            sleep 2  # Wait for service to fully initialize
        else
            echo "[ERROR] Failed to start MariaDB. Please start it manually:"
            echo "       sudo systemctl start mysql  # For systemd"
            echo "       sudo service mysql start    # For SysVinit"
            exit 1
        fi
    fi
    
    # FIX: Seed the database WITHOUT sudo password prompts
    echo "[WAIT] Seeding MariaDB database..."
    
    # Try socket authentication first (works on Pi without password)
    if mysql -e "SELECT 1" &>/dev/null; then
        # Root has socket auth - no password needed
        echo "[INFO] Using socket authentication (no password)..."
        mysql -e "CREATE DATABASE IF NOT EXISTS campus_admin;"
        mysql campus_admin < database/schema_mariadb.sql
    elif sudo mysql -e "SELECT 1" &>/dev/null 2>&1; then
        # Fallback: use sudo (will still require password if not cached)
        echo "[INFO] Using sudo authentication (may prompt for password)..."
        sudo mysql -e "CREATE DATABASE IF NOT EXISTS campus_admin;"
        sudo mysql campus_admin < database/schema_mariadb.sql
    else
        echo "[WARNING] Could not authenticate to MariaDB."
        echo "[INFO] Continuing without database seeding. You may need to seed manually."
    fi
fi

# 3. Resolve Dependencies
if [ ! -d "campus-dashboard/node_modules" ]; then
    echo "[WAIT] Installing Frontend Dependencies..."
    (cd campus-dashboard && npm install) || { echo "[ERROR] npm install failed"; exit 1; }
fi

if [ ! -d "campus-edge/venv" ]; then
    echo "[WAIT] Configuring Python AI Environment..."
    (cd campus-edge && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt) || { echo "[ERROR] Python setup failed"; exit 1; }
fi

# 4. Launch Services
echo "[START] Launching all services..."
echo "       Frontend: http://localhost:5173"
echo "       Backend:  http://localhost:5000"
echo "       Edge Node: Running in background"
echo ""
echo "Press Ctrl+C to stop all services..."
echo ""

trap 'echo "[STOP] Shutting down services..."; kill 0' SIGINT
(cd campus-dashboard && npm run dev) &
(cd campus-backend && dotnet run) &
(cd campus-edge && source venv/bin/activate && python3 app.py) &

wait
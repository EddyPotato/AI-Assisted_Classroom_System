#!/bin/bash
# File: start_linux.sh
# Version: v2.3
# Changes: Enforced legacy setuptools installation to prevent face_recognition pkg_resources crash.

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

# 2. Check if MariaDB is running before attempting to seed
if [ -f "database/schema_mariadb.sql" ]; then
    echo "[WAIT] Checking MariaDB service..."
    if ! pgrep -x "mysqld" > /dev/null; then
        echo "[WARNING] MariaDB/MySQL daemon is not running."
        echo "[INFO] Attempting to start MariaDB service..."
        if sudo systemctl start mysql 2>/dev/null || sudo service mysql start 2>/dev/null; then
            echo "[SUCCESS] MariaDB service started."
            sleep 2
        else
            echo "[ERROR] Failed to start MariaDB. Please start it manually:"
            echo "       sudo systemctl start mysql  # For systemd"
            echo "       sudo service mysql start    # For SysVinit"
        fi
    fi

    # Seed Database
    if sudo mysql -e "SELECT 1" &>/dev/null 2>&1; then
        echo "[INFO] Using passwordless root auth..."
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
    # Injects the setuptools downgrade before processing the main requirements
    (cd campus-edge && python3 -m venv venv && source venv/bin/activate && pip install "setuptools<70" --force-reinstall && pip install -r requirements.txt) || { echo "[ERROR] Python setup failed"; exit 1; }
fi

# 4. Launch Services
echo "[START] Launching all services..."
echo "       Frontend: http://localhost:5173"
echo "       Backend:  http://localhost:5106"
echo "       Edge Node: Running in background"
echo ""
echo "Press Ctrl+C to stop all services..."
echo ""

trap 'echo "[STOP] Shutting down services..."; kill 0' SIGINT
(cd campus-dashboard && npm run dev) &
(cd campus-backend && dotnet run) &
(cd campus-edge && source venv/bin/activate && python3 app.py) &

wait
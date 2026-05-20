:: File: start_windows.bat
:: Version: v2.0
:: Description: OS-aware launcher. Restores Windows/Oracle state and boots system.

@echo off
TITLE AI-Assisted Classroom System (Windows)
COLOR 0B

echo ===================================================
echo Booting Windows Environment
echo ===================================================

:: OS Check
IF NOT "%OS%"=="Windows_NT" (
    echo [ERROR] Linux/Mac OS detected. 
    echo Please close this window and run './start_linux.sh' instead.
    pause
    exit /b
)

:: Execute the Reverse Mutator
echo [WAIT] Ensuring codebase is configured for Oracle DB...
python scripts\make_windows_compatible.py

:: Dependency Resolution
IF NOT EXIST "campus-dashboard\node_modules" (
    echo [WAIT] Installing Dashboard Dependencies...
    cd campus-dashboard && call npm install && cd ..
)

IF NOT EXIST "campus-edge\venv" (
    echo [WAIT] Configuring Python AI Environment...
    cd campus-edge && python -m venv venv && call venv\Scripts\activate.bat && pip install -r requirements.txt && cd ..
)

:: Boot Sequence
start "Frontend" cmd /c "cd campus-dashboard && npm run dev"
start "Backend" cmd /c "cd campus-backend && dotnet run"
start "Edge Node" cmd /c "cd campus-edge && call venv\Scripts\activate.bat && python app.py"
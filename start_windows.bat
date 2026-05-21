:: File: start_windows.bat
:: Version: v2.3
:: Changes: Enforced legacy setuptools installation to prevent face_recognition pkg_resources crash.

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

:: Execute the Reverse Mutator (Using 'py' to bypass Microsoft Store trap)
echo [WAIT] Ensuring codebase is configured for Oracle DB...
py scripts\make_windows_compatible.py
IF %ERRORLEVEL% NEQ 0 (
    echo [FATAL ERROR] Python mutator script failed. Check if Python is installed.
    pause
    exit /b
)

:: Dependency Resolution
IF NOT EXIST "campus-dashboard\node_modules" (
    echo [WAIT] Installing Dashboard Dependencies...
    cd campus-dashboard && call npm install && cd ..
)

IF NOT EXIST "campus-edge\venv" (
    echo [WAIT] Configuring Python AI Environment...
    :: Injects the setuptools downgrade before processing the main requirements
    cd campus-edge && py -m venv venv && call venv\Scripts\activate.bat && pip install "setuptools<70" --force-reinstall && pip install -r requirements.txt && cd ..
)

:: Boot Sequence
echo [WAIT] Launching Server Terminals...
echo [WAIT] Closing any previous backend instance to avoid dotnet build file locks...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Process campus-backend -ErrorAction SilentlyContinue | Where-Object { $_.Path -like '*AI-Assisted_Classroom_System*campus-backend*' } | Stop-Process -Force"
start "Frontend" cmd /k "cd campus-dashboard && npm run dev"
start "Backend" cmd /k "cd campus-backend && dotnet run"
start "Edge Node" cmd /k "cd campus-edge && call venv\Scripts\activate.bat && python app.py"

echo ===================================================
echo System boot sequence initiated. 
echo Three separate terminal windows should now remain open.
echo ===================================================
pause

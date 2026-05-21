@echo off
setlocal

set "ROOT=%~dp0.."
set "BACKEND=%ROOT%\campus-backend"
set "BACKEND_EXE=%BACKEND%\bin\Debug\net10.0\campus-backend.exe"

echo [WAIT] Stopping running campus-backend processes that lock the build output...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Process campus-backend -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq '%BACKEND_EXE%' } | Stop-Process -Force"

echo [WAIT] Building campus-backend...
dotnet build "%BACKEND%\campus-backend.csproj" --no-restore

if errorlevel 1 (
  echo [ERROR] Backend build failed.
  exit /b 1
)

echo [OK] Backend build succeeded.
echo [TIP] Start the backend only after building: cd campus-backend ^&^& dotnet run --no-build
endlocal

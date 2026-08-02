@echo off
echo Starting Frontend (React/Vite) and Backend (FastAPI)...

:: Start Frontend dev server in a new window
start "Frontend Dev Server" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: Start Backend server in a new window
start "Backend API Server" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate && uvicorn main:app --reload"

echo Done. Both servers should now be running in separate windows.

Write-Host "Starting Frontend (React/Vite) and Backend (FastAPI)..." -ForegroundColor Cyan

# Start Frontend dev server in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

# Start Backend API server in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .\venv\Scripts\Activate.ps1; uvicorn main:app --reload"

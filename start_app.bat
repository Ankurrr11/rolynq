@echo off
echo Starting Ankur-Hunt...

:: Start Backend
start "Ankur-Hunt Backend" cmd /k "echo Starting Backend... && venv\Scripts\python backend\app.py"

:: Start Frontend
start "Ankur-Hunt Frontend" cmd /k "echo Starting Frontend... && cd frontend && npm run dev"

echo Application launched! 
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5001
pause

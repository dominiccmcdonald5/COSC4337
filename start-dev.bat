@echo off
echo Starting Biodiversity Analysis Application...
echo.

echo Starting Backend Server (Flask)...
start "Backend Server" cmd /k "cd Backend && venv\Scripts\activate && python app.py"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend Server (Next.js)...
start "Frontend Server" cmd /k "cd Frontend\animal-audio-app && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
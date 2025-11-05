@echo off
echo Installing Biodiversity Analysis Web Application...
echo.

echo Step 1: Setting up Backend...
cd Backend

echo Creating Python virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Step 2: Setting up Frontend...
cd ..\Frontend\animal-audio-app

echo Installing Node.js dependencies...
call npm install

echo.
echo Setup complete!
echo.
echo To start the application:
echo 1. Start backend: cd Backend && venv\Scripts\activate && python app.py
echo 2. Start frontend: cd Frontend\animal-audio-app && npm run dev
echo 3. Open http://localhost:3000 in your browser
echo.
pause
@echo off
cd /d "%~dp0server"
if not exist "node_modules" (
  echo Installing backend dependencies (first run only)...
  call npm install
)
echo Starting TravelOnBuddy API on http://localhost:4000 ...
echo Keep this window open while you use the site. Close it to stop the server.
call npm run dev
pause

@echo off
cd /d "%~dp0"
echo Starting TravelOnBuddy dev server...
echo Browser will open automatically. Keep this window open while you work.
echo Close this window to stop the server.
echo.
echo NOTE: login/signup, "Become a buddy" and "Plan my trip" need the API too.
echo Run start-backend.bat in another window first if you haven't already.
echo.
call npm run dev
pause

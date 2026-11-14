@echo off
rem Stop Docmost completely: app on port 3000 + dependency containers
cd /d "%~dp0"

echo Stopping app on port 3000 ...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
  echo Killing PID %%a
  taskkill /PID %%a /F >nul 2>&1
)

echo Stopping containers (PostgreSQL / Redis / Gotenberg) ...
docker compose -f docker-compose.deps.yml stop

echo.
echo Done. Data is kept in the Docker volumes. Start again with start-docmost.cmd.
pause

@echo off
rem Start Docmost: dependency containers + app (this window stays open)
title Docmost Server
cd /d "%~dp0"

echo [1/3] Checking Docker Engine ...
docker info >nul 2>&1
if errorlevel 1 goto nodocker

echo [2/3] Starting containers (PostgreSQL / Redis / Gotenberg) ...
docker compose -f docker-compose.deps.yml up -d
if errorlevel 1 goto depsfail

echo [3/3] Starting Docmost app ...
echo.
echo Open http://localhost:3000 after about 20 seconds.
echo Keep this window open. Press Ctrl+C or close it to stop the app.
echo Log is also written to server-run.log
echo.
pnpm start
goto end

:nodocker
echo ERROR: Docker Desktop is not running. Start it first, then run this again.
pause

:depsfail
echo ERROR: failed to start dependency containers. Check Docker Desktop.
pause

:end

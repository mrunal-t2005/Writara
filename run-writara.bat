@echo off
title Writara AI Platform Launcher
color 0B
echo ==========================================================
echo    WRITARA - AI-Powered Content Generation Platform
echo ==========================================================
echo.

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000...
start "Writara Backend" cmd /k "cd /d "%~dp0backend" && .\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Vite Frontend on http://localhost:5173...
start "Writara Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ==========================================================
echo   Writara is launched!
echo   Frontend:  http://localhost:5173
echo   API Docs:  http://127.0.0.1:8000/docs
echo ==========================================================
echo.
pause

<#
.SYNOPSIS
    Starts Writara AI Content Generation Platform (FastAPI Backend + Vite Frontend)
#>

Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host "   WRITARA — AI-Powered Content Generation Platform       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host ""

$root = $PSScriptRoot

Write-Host "[1/2] Starting Writara Backend (FastAPI on http://127.0.0.1:8000)..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; .\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload" -PassThru

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting Writara Frontend (Vite on http://localhost:5173)..." -ForegroundColor Yellow
$frontendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev" -PassThru

Write-Host ""
Write-Host "✨ Writara is starting!" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C or close the opened windows to stop." -ForegroundColor Gray

@echo off
title CreditPilot AI
cd /d "%~dp0"

powershell.exe -NoProfile -Command "$listener = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; if ($listener) { Stop-Process -Id $listener.OwningProcess -Force }"
if exist ".next" rmdir /s /q ".next"

echo Starting CreditPilot AI...
echo Keep this window open while using the app.
echo.
"C:\Program Files\nodejs\npm.cmd" run dev

pause

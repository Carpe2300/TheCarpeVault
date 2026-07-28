@echo off
setlocal

set "ROOT=%~dp0"
set "NODE=C:\Users\david\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "PORT=8789"

cd /d "%ROOT%"

where powershell.exe >nul 2>nul
if errorlevel 1 (
  echo No encuentro PowerShell.
  pause
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command ^
  "$port=%PORT%; $listeners=Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue; foreach ($listener in $listeners) { $process=Get-Process -Id $listener.OwningProcess -ErrorAction SilentlyContinue; if ($process -and $process.ProcessName -eq 'node') { Stop-Process -Id $process.Id -Force } }; Start-Sleep -Milliseconds 250; Start-Process -FilePath '%NODE%' -ArgumentList 'local-server.cjs' -WorkingDirectory '%ROOT%' -WindowStyle Hidden"

timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:%PORT%/index.html"

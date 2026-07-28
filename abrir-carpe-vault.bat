@echo off
setlocal

set "ROOT=%~dp0"
set "NODE=C:\Users\david\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "PORT=8788"

cd /d "%ROOT%"

where powershell.exe >nul 2>nul
if errorlevel 1 (
  echo No encuentro PowerShell.
  pause
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command ^
  "$port=%PORT%; $alive=$false; try { $r=Invoke-WebRequest -UseBasicParsing -Uri ('http://127.0.0.1:'+$port+'/api/playstation/status') -TimeoutSec 1; $alive=$r.StatusCode -eq 200 } catch {}; if (-not $alive) { $listeners=Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue; foreach ($listener in $listeners) { $process=Get-Process -Id $listener.OwningProcess -ErrorAction SilentlyContinue; if ($process -and $process.ProcessName -eq 'node') { Stop-Process -Id $process.Id -Force } }; Start-Process -FilePath '%NODE%' -ArgumentList 'local-server.cjs' -WorkingDirectory '%ROOT%' -WindowStyle Hidden }"

timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:%PORT%/index.html"

@echo off
setlocal enabledelayedexpansion
set "ENCONTRADO="
rem Mata solo el proceso que escucha en 127.0.0.1:8765 (no otros python/node).
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:"127.0.0.1:8765 .*LISTENING"') do (
  if not "%%P"=="0" (
    taskkill /PID %%P /T /F >nul 2>&1
    echo  [ok] Servidor detenido, PID %%P.
    set "ENCONTRADO=1"
  )
)
if not defined ENCONTRADO echo  No habia servidor escuchando en el puerto 8765.
rem Cierra la ventana minimizada del servidor si quedo abierta.
taskkill /FI "WINDOWTITLE eq Servidor Radar BCS*" /F >nul 2>&1
endlocal
if /i not "%~1"=="/silencioso" ping -n 3 127.0.0.1 >nul

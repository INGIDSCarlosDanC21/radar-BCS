@echo off
setlocal
cd /d "%~dp0"
title Radar BCS - Presentacion
echo.
echo  === RADAR BCS - PRESENTACION ===
echo.

rem --- (b) Video opcional ---
if not exist "assets\video" mkdir "assets\video" >nul 2>&1
if exist "assets\video\trailer.mp4" goto video_ok
if exist "..\video\out\trailer-radar-bcs-v4.mp4" (
  copy /y "..\video\out\trailer-radar-bcs-v4.mp4" "assets\video\trailer.mp4" >nul
  echo  [ok] Video copiado a assets\video\trailer.mp4
  goto video_ok
)
echo  [aviso] No se encontro el video trailer.mp4.
echo          Es OPCIONAL: la demo funciona con las capturas.
echo          Si lo quieres, copialo desde Drive o USB a presentacion\assets\video\trailer.mp4
:video_ok

rem --- (c) Regenerar index.html ---
where node >nul 2>&1
if errorlevel 1 (
  echo  [aviso] Node no esta instalado: se usa el index.html ya generado.
) else (
  node build.mjs
  if errorlevel 1 echo  [aviso] build.mjs fallo: se usa el index.html anterior.
)
if not exist "index.html" (
  echo  [error] No existe index.html y no se pudo generar. Avisa al lider.
  pause
  exit /b 1
)

rem --- (d) Servidor local (si ya hay uno en 8765 de una corrida anterior, se reinicia) ---
call "%~dp0DETENER-PRESENTACION.bat" /silencioso
set "URL=http://127.0.0.1:8765/index.html"
set "SERVIDOR="
where py >nul 2>&1
if not errorlevel 1 (
  start "Servidor Radar BCS" /min py -m http.server 8765 --bind 127.0.0.1
  set "SERVIDOR=py"
  goto servidor_listo
)
where python >nul 2>&1
if not errorlevel 1 (
  start "Servidor Radar BCS" /min python -m http.server 8765 --bind 127.0.0.1
  set "SERVIDOR=python"
  goto servidor_listo
)
where npx >nul 2>&1
if not errorlevel 1 (
  start "Servidor Radar BCS" /min cmd /c npx --yes http-server -p 8765 -a 127.0.0.1
  set "SERVIDOR=npx"
  goto servidor_listo
)
echo  [aviso] No hay Python ni Node: se abre index.html directo (file://).
echo          El video y el 3D pueden no cargar; las capturas si.
set "URL=file:///%~dp0index.html"
set "URL=%URL:\=/%"
goto abrir

:servidor_listo
echo  [ok] Servidor local (%SERVIDOR%) en http://127.0.0.1:8765
ping -n 3 127.0.0.1 >nul

rem --- (e) Abrir navegador ---
:abrir
set "CHROME="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if defined CHROME (
  start "" "%CHROME%" --app=%URL% --window-size=1280,720 --user-data-dir="%TEMP%\radarbcs-chrome" --autoplay-policy=no-user-gesture-required
  goto teclas
)
set "EDGE="
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not defined EDGE if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if defined EDGE (
  echo  [aviso] No hay Chrome: se usa Edge.
  start "" "%EDGE%" --app=%URL% --window-size=1280,720 --user-data-dir="%TEMP%\radarbcs-edge" --autoplay-policy=no-user-gesture-required
  goto teclas
)
echo  [aviso] No hay Chrome ni Edge: se abre el navegador por defecto.
start "" "%URL%"

:teclas
echo.
echo  TECLAS
echo    Flechas izq/der  retroceder / avanzar
echo    T  cronometro (parte / global)
echo    R  reinicia el cronometro
echo    S  notas del orador
echo    F  pantalla completa
echo.
echo  RESPALDO (sin servidor): doble clic en
echo    %~dp0index.html
echo.
echo  Al terminar, ejecuta DETENER-PRESENTACION.bat
echo  (apaga el servidor del puerto 8765).
echo.
pause
endlocal

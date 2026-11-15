@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Radar BCS - Instalar dependencias
set "V=%~dp0vendor"
set "FALTA="
for %%F in (reveal\reveal.js reveal\reveal.css reveal\reset.css reveal\plugin\notes\notes.js anime\anime.min.js fonts\space-grotesk-latin-500-normal.woff2 fonts\space-grotesk-latin-700-normal.woff2 fonts\manrope-latin-600-normal.woff2 fonts\manrope-latin-800-normal.woff2 fonts\jetbrains-mono-latin-500-normal.woff2 fonts\fuentes.css) do (
  if not exist "%V%\%%F" (
    echo  Falta vendor\%%F
    set "FALTA=1"
  )
)
if not defined FALTA (
  echo  No hace falta instalar nada: vendor\ esta completo.
  if /i not "%~1"=="/silencioso" pause
  exit /b 0
)
where npm >nul 2>&1
if errorlevel 1 (
  echo  [error] Falta npm. Instala Node.js desde nodejs.org o copia vendor\ desde Drive.
  pause
  exit /b 1
)
where tar >nul 2>&1
if errorlevel 1 (
  echo  [error] Falta tar, que Windows 10 o superior trae de serie.
  pause
  exit /b 1
)
set "T=%TEMP%\radarbcs-vendor-%RANDOM%%RANDOM%"
mkdir "%T%\dl" || (echo  [error] No pude crear %T% & pause & exit /b 1)
echo  Descargando paquetes a %T% sin ejecutar scripts...
pushd "%T%\dl"
call npm pack --ignore-scripts reveal.js@5.2.1 animejs@3.2.2 @fontsource/space-grotesk@5.3.0 @fontsource/manrope@5.3.0 @fontsource/jetbrains-mono@5.3.0
popd
for %%N in (reveal.js-5.2.1 animejs-3.2.2 fontsource-space-grotesk-5.3.0 fontsource-manrope-5.3.0 fontsource-jetbrains-mono-5.3.0) do (
  mkdir "%T%\%%N" >nul 2>&1
  if exist "%T%\dl\%%N.tgz" tar -xzf "%T%\dl\%%N.tgz" -C "%T%\%%N"
)
mkdir "%V%\reveal\plugin\notes" "%V%\anime" "%V%\fonts" >nul 2>&1
set "R=%T%\reveal.js-5.2.1\package"
copy /y "%R%\dist\reveal.js" "%V%\reveal\" >nul
copy /y "%R%\dist\reveal.css" "%V%\reveal\" >nul
copy /y "%R%\dist\reset.css" "%V%\reveal\" >nul
copy /y "%R%\plugin\notes\notes.js" "%V%\reveal\plugin\notes\" >nul
copy /y "%R%\LICENSE" "%V%\reveal\" >nul
set "A=%T%\animejs-3.2.2\package"
copy /y "%A%\lib\anime.min.js" "%V%\anime\" >nul
copy /y "%A%\LICENSE.md" "%V%\anime\" >nul
set "S=%T%\fontsource-space-grotesk-5.3.0\package"
copy /y "%S%\files\space-grotesk-latin-500-normal.woff2" "%V%\fonts\" >nul
copy /y "%S%\files\space-grotesk-latin-700-normal.woff2" "%V%\fonts\" >nul
copy /y "%S%\LICENSE" "%V%\fonts\LICENSE-space-grotesk.txt" >nul
set "M=%T%\fontsource-manrope-5.3.0\package"
copy /y "%M%\files\manrope-latin-600-normal.woff2" "%V%\fonts\" >nul
copy /y "%M%\files\manrope-latin-800-normal.woff2" "%V%\fonts\" >nul
copy /y "%M%\LICENSE" "%V%\fonts\LICENSE-manrope.txt" >nul
set "J=%T%\fontsource-jetbrains-mono-5.3.0\package"
copy /y "%J%\files\jetbrains-mono-latin-500-normal.woff2" "%V%\fonts\" >nul
copy /y "%J%\LICENSE" "%V%\fonts\LICENSE-jetbrains-mono.txt" >nul
echo.
set "FALTA="
for %%F in (reveal\reveal.js reveal\reveal.css reveal\reset.css reveal\plugin\notes\notes.js anime\anime.min.js fonts\space-grotesk-latin-500-normal.woff2 fonts\space-grotesk-latin-700-normal.woff2 fonts\manrope-latin-600-normal.woff2 fonts\manrope-latin-800-normal.woff2 fonts\jetbrains-mono-latin-500-normal.woff2) do (
  if not exist "%V%\%%F" (
    echo  Sigue faltando vendor\%%F
    set "FALTA=1"
  )
)
if not exist "%V%\fonts\fuentes.css" (
  echo  Falta vendor\fonts\fuentes.css: es de este repo, no del paquete. Recuperalo con git checkout.
  set "FALTA=1"
)
if defined FALTA (
  echo  Instalacion incompleta. Avisa al lider.
) else (
  echo  Listo: vendor\ completo.
)
echo  Carpeta temporal, puedes borrarla: %T%
pause
endlocal

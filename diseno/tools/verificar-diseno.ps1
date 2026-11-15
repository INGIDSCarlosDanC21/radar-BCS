# Verifica el diseno y confirma que web/ no se rompio.
# Uso (desde cualquier carpeta): powershell -File diseno/tools/verificar-diseno.ps1
$ErrorActionPreference = 'Continue'
$raiz = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $raiz

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host 'No se encontro node. Instalalo (https://nodejs.org) e intenta otra vez.'
    exit 1
}

$fallos = 0

Write-Host '== Pruebas de diseno (diseno/tests) =='
# En Node 22+ hay que pasar un patron (glob); "diseno/tests/" a secas ya no funciona.
node --test "diseno/tests/*.test.mjs"
if ($LASTEXITCODE -ne 0) { $fallos++; Write-Host 'FALLO: pruebas de diseno' }

Write-Host ''
Write-Host '== Pruebas de la web de Diego (web/tests) =='
node --test "web/tests/*.test.mjs"
if ($LASTEXITCODE -ne 0) { $fallos++; Write-Host 'FALLO: pruebas de web' }

Write-Host ''
if ($fallos -gt 0) { Write-Host "Resultado: $fallos grupo(s) con fallos."; exit 1 }
Write-Host 'Resultado: todo en verde.'
exit 0

<#
.SYNOPSIS
  Puerta de calidad de Radar BCS: un solo comando antes de pasar dev a main.
.DESCRIPTION
  Corre, en orden y sin detenerse en la primera falla:
    1. pytest de analisis
    2. python -m analisis.validar  (contrato de datos + campos *_en)
    3. node --test de web/tests y de diseno/tests (si existen)
    4. web/data/{indicadores.json,zonas.geojson,zonas_tendencias.json} idénticos a data/salida/
    5. ningún archivo del repo pesa más de 5 MB
  Al final imprime un resumen y sale con código 1 si algo falló.
  Python: usa $env:PYTHON si está definido; si no, "python" (o "py"). Requiere pytest y las dependencias de analisis/requirements.txt.
.EXAMPLE
  pwsh scripts/verificar-todo.ps1
#>
$ErrorActionPreference = "Continue"
$raiz = Split-Path -Parent $PSScriptRoot
Set-Location $raiz

$fallas = New-Object System.Collections.Generic.List[string]
function Paso($texto) { Write-Host "`n== $texto" -ForegroundColor Cyan }
function Falla($texto) { Write-Host "FALLA: $texto" -ForegroundColor Red; $script:fallas.Add($texto) }
function Bien($texto) { Write-Host "OK: $texto" -ForegroundColor Green }

# --- Python
$py = $env:PYTHON
if (-not $py) {
  foreach ($c in "python", "py") { if (Get-Command $c -ErrorAction SilentlyContinue) { $py = $c; break } }
}

Paso "1/5 pytest de analisis"
if (-not $py) { Falla "No hay Python en el PATH (instala Python 3.12 o define `$env:PYTHON)" }
else {
  & $py -m pytest analisis -q
  if ($LASTEXITCODE -eq 0) { Bien "pytest" } else { Falla "pytest de analisis (código $LASTEXITCODE; si dice 'No module named pytest', corre: $py -m pip install -r analisis/requirements.txt pytest)" }
}

Paso "2/5 validar data/salida/ contra el contrato (incluye los textos *_en)"
if ($py) {
  & $py -m analisis.validar
  if ($LASTEXITCODE -eq 0) { Bien "analisis.validar" } else { Falla "analisis.validar encontró errores en data/salida/ (arriba está la lista)" }
}

Paso "3/5 pruebas de node (web y diseño)"
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { Falla "node no está instalado: no se pueden correr las pruebas de web/ (instala Node 20 o superior)" }
else {
  foreach ($carpeta in "web/tests", "diseno/tests") {
    if (-not (Test-Path (Join-Path $raiz $carpeta))) { Write-Host "(no existe $carpeta; se omite)"; continue }
    $archivos = @(Get-ChildItem (Join-Path $raiz $carpeta) -Filter "*.test.mjs" | ForEach-Object { "$carpeta/$($_.Name)" })
    if (-not $archivos) { Write-Host "(sin archivos *.test.mjs en $carpeta; se omite)"; continue }
    & node --test @archivos
    if ($LASTEXITCODE -eq 0) { Bien "node --test $carpeta" } else { Falla "node --test $carpeta (código $LASTEXITCODE)" }
  }
}

Paso "4/5 web/data idéntico a data/salida"
foreach ($nombre in "indicadores.json", "zonas.geojson", "zonas_tendencias.json") {
  $origen = Join-Path $raiz "data/salida/$nombre"
  $copia = Join-Path $raiz "web/data/$nombre"
  if (-not (Test-Path $origen)) { Falla "falta data/salida/$nombre (corre python -m analisis.exportar y python -m analisis.zonas)"; continue }
  if (-not (Test-Path $copia)) { Falla "falta web/data/$nombre (cópialo desde data/salida/)"; continue }
  # se comparan los bytes sin fin de línea, para que CRLF/LF no den falsas diferencias
  $a = (Get-Content $origen -Raw -Encoding UTF8) -replace "`r`n", "`n"
  $b = (Get-Content $copia -Raw -Encoding UTF8) -replace "`r`n", "`n"
  if ($a -ceq $b) { Bien "web/data/$nombre = data/salida/$nombre" }
  else { Falla "web/data/$nombre difiere de data/salida/$nombre (copia data/salida/ a web/data/ y vuelve a correr)" }
}

Paso "5/5 ningún archivo pesa más de 5 MB"
$limite = 5MB
$lista = if (Get-Command git -ErrorAction SilentlyContinue) { git -C $raiz ls-files --cached --others --exclude-standard } else { $null }
if (-not $lista) { $lista = Get-ChildItem $raiz -Recurse -File -Force | Where-Object { $_.FullName -notmatch "[\\/]\.git[\\/]" } | ForEach-Object { $_.FullName.Substring($raiz.Length + 1) } }
$pesados = @()
foreach ($rel in $lista) {
  $ruta = Join-Path $raiz $rel
  if ((Test-Path $ruta -PathType Leaf) -and (Get-Item $ruta).Length -gt $limite) { $pesados += "{0} ({1:N1} MB)" -f $rel, ((Get-Item $ruta).Length / 1MB) }
}
if ($pesados.Count -eq 0) { Bien "ningún archivo supera 5 MB" }
else { foreach ($p in $pesados) { Falla "pesa más de 5 MB: $p (va a Google Drive, ver docs/DRIVE.md)" } }

Write-Host ""
if ($fallas.Count -eq 0) { Write-Host "TODO EN ORDEN: la puerta de calidad pasa." -ForegroundColor Green; exit 0 }
Write-Host "NO PASA la puerta de calidad ($($fallas.Count) falla(s)):" -ForegroundColor Red
foreach ($f in $fallas) { Write-Host " - $f" -ForegroundColor Red }
exit 1

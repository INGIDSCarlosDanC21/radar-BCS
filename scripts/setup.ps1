<#
.SYNOPSIS
  Prepara la maquina para trabajar en Radar BCS. Idempotente, sin admin.
.DESCRIPTION
  Comprueba git/gh/node/uv, instala Python 3.12, markitdown, skillspector y agentes
  gratuitos (solo los que falten). Un paso opcional que falla avisa y sigue.
.PARAMETER Extras
  Instala tambien Gemini CLI, Qwen Code y Aider (no van por defecto).
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
#>
param([switch]$Extras)

$ErrorActionPreference = 'Continue'
$raiz = Split-Path -Parent $PSScriptRoot
$resumen = [ordered]@{}

function Info($m) { Write-Host "[..] $m" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "[OK] $m" -ForegroundColor Green }
function Aviso($m){ Write-Host "[!!] $m" -ForegroundColor Yellow }

function Tiene($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

# Refresca el PATH de la sesion (tras winget/uv/npm los binarios nuevos aparecen en el PATH de usuario)
function Refrescar-Path {
  $m = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $u = [Environment]::GetEnvironmentVariable('Path', 'User')
  $extra = @("$env:USERPROFILE\.local\bin", "$env:APPDATA\npm")
  $env:Path = (@($m, $u) + $extra | Where-Object { $_ }) -join ';'
}

function Version-De($cmd, $arg = '--version') {
  try { return ((& $cmd $arg 2>$null | Select-Object -First 1) -as [string]).Trim() } catch { return '' }
}

# Ejecuta un paso opcional: nunca detiene el script.
function Paso($nombre, [scriptblock]$bloque) {
  Info $nombre
  try { & $bloque } catch { Aviso "$nombre fallo: $($_.Exception.Message)" }
}

function Winget-Instalar($id) {
  if (-not (Tiene 'winget')) { Aviso "winget no disponible; instala $id a mano."; return }
  winget install --id $id -e --scope user --silent --accept-package-agreements --accept-source-agreements
  if ($LASTEXITCODE -ne 0) {
    # algunos paquetes no soportan --scope user; reintenta sin el
    winget install --id $id -e --silent --accept-package-agreements --accept-source-agreements
  }
  Refrescar-Path
}

Refrescar-Path

# ---------- 1. Requisitos base ----------
Paso 'Comprobando git / gh / node / uv' {
  if (-not (Tiene 'git')) { Aviso 'Falta git. Instala con: winget install Git.Git' }
  if (-not (Tiene 'gh'))  { Aviso 'Falta gh. Instala con: winget install GitHub.cli' }
  if (-not (Tiene 'node')){ Aviso 'Falta node. Instala con: winget install OpenJS.NodeJS.LTS' }
  if (-not (Tiene 'uv')) {
    Aviso 'Falta uv; instalando con winget...'
    Winget-Instalar 'astral-sh.uv'
  }
}

# ---------- 2. Python / herramientas uv ----------
if (Tiene 'uv') {
  Paso 'Python 3.12 (uv python install)' {
    uv python install 3.12
    if ($LASTEXITCODE -ne 0) { Aviso 'No se pudo instalar Python 3.12 con uv.' }
  }
  Paso 'markitdown[all]' {
    if (Tiene 'markitdown') { Ok 'markitdown ya instalado' }
    else {
      uv tool install --python 3.12 "markitdown[all]"
      if ($LASTEXITCODE -ne 0) { Aviso 'Fallo markitdown[all]; reintentando solo con pdf/docx...'; uv tool install --python 3.12 "markitdown[pdf,docx]" }
    }
  }
  Paso 'skillspector (NVIDIA)' {
    if (Tiene 'skillspector') { Ok 'skillspector ya instalado' }
    else {
      uv tool install --python 3.12 git+https://github.com/NVIDIA/skillspector.git
      if ($LASTEXITCODE -ne 0) { Aviso 'No se pudo instalar skillspector (opcional).' }
    }
  }
  uv tool update-shell 2>$null | Out-Null
  Refrescar-Path
} else {
  Aviso 'Sin uv no se instalan Python, markitdown ni skillspector. Reabre la terminal y repite.'
}

# ---------- 3. Agentes gratuitos (solo si faltan) ----------
$tieneNpm = Tiene 'npm'

function Instalar-Npm($cmd, $paquete) {
  if (Tiene $cmd) { Ok "$cmd ya instalado"; return }
  if (-not $tieneNpm) { Aviso "Sin npm no se puede instalar $cmd (instala Node: winget install OpenJS.NodeJS.LTS)."; return }
  npm install -g $paquete
  if ($LASTEXITCODE -ne 0) { Aviso "Fallo npm install -g $paquete" }
  Refrescar-Path
}

Paso 'Codex CLI' { Instalar-Npm 'codex' '@openai/codex' }

Paso 'OpenCode' {
  if (Tiene 'opencode') { Ok 'opencode ya instalado'; return }
  # Paquete oficial vigente (verificado con `npm view opencode-ai`): opencode-ai
  $nombre = (npm view opencode-ai name 2>$null | Select-Object -First 1)
  if ($nombre -match 'opencode-ai') { Instalar-Npm 'opencode' 'opencode-ai' }
  else { Aviso 'npm view no confirmo el paquete opencode-ai; revisa https://opencode.ai' }
}

Paso 'Crush' {
  if (Tiene 'crush') { Ok 'crush ya instalado'; return }
  Winget-Instalar 'charmbracelet.crush'
  if (-not (Tiene 'crush')) { Aviso 'Crush no quedo en el PATH (reabre la terminal o instalalo a mano).' }
}

Paso 'Ollama' {
  if (Tiene 'ollama') { Ok 'ollama ya instalado' }
  else {
    Winget-Instalar 'Ollama.Ollama'
    if (-not (Tiene 'ollama')) {
      $p = "$env:LOCALAPPDATA\Programs\Ollama"
      if (Test-Path "$p\ollama.exe") { $env:Path += ";$p" }
    }
  }
  if (Tiene 'ollama') {
    $lista = @(ollama list 2>$null | Select-Object -Skip 1 | Where-Object { $_.Trim() })
    if ($lista.Count -eq 0) {
      Info 'Ollama sin modelos: descargando gemma3:4b (~3.4 GB)...'
      ollama pull gemma3:4b
      if ($LASTEXITCODE -ne 0) { Aviso 'No se pudo bajar gemma3:4b (esta corriendo el servicio de ollama?).' }
    } else { Ok "ollama con $($lista.Count) modelo(s)" }
  }
}

# ---------- 4. Extras opcionales ----------
if ($Extras) {
  Paso 'Extras: Gemini CLI' { Instalar-Npm 'gemini' '@google/gemini-cli' }
  Paso 'Extras: Qwen Code'  { Instalar-Npm 'qwen' '@qwen-code/qwen-code' }
  Paso 'Extras: Aider' {
    if (Tiene 'aider') { Ok 'aider ya instalado' }
    elseif (Tiene 'uv') { uv tool install --python 3.12 aider-chat; if ($LASTEXITCODE -ne 0) { Aviso 'Fallo aider-chat' } }
  }
}

# ---------- 4b. Plugin superpowers para Claude Code ----------
Paso 'Plugin superpowers (Claude Code)' {
  if (Tiene 'claude') {
    claude plugin install superpowers@claude-plugins-official --scope project 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { Ok 'superpowers instalado (o ya estaba)' }
    else { Aviso 'No se instalo superpowers; dentro de Claude Code ejecuta: /plugin install superpowers@claude-plugins-official' }
  } else { Info 'Claude Code no encontrado; omito superpowers.' }
}

# ---------- 5. .env ----------
Paso '.env' {
  $env1 = Join-Path $raiz '.env'
  $ej = Join-Path $raiz '.env.example'
  if (Test-Path $env1) { Ok '.env ya existe (no se toca)' }
  elseif (Test-Path $ej) { Copy-Item $ej $env1; Ok '.env creado desde .env.example; rellena tus claves (no se sube a git).' }
  else { Aviso 'No existe .env.example; .env no creado.' }
}

# ---------- 6. Resumen ----------
Refrescar-Path
Write-Host ''
Write-Host '=== Resumen de herramientas ===' -ForegroundColor Cyan
$filas = @()
foreach ($t in 'git','gh','node','npm','uv','markitdown','skillspector','codex','opencode','crush','ollama','gemini','qwen','aider') {
  $ok = Tiene $t
  $filas += [pscustomobject]@{ Herramienta = $t; Estado = $(if ($ok) { 'OK' } else { 'falta' }); Version = $(if ($ok) { Version-De $t } else { '' }) }
}
$filas | Format-Table -AutoSize

Write-Host '=== Pendiente de login / accion humana ===' -ForegroundColor Cyan
if (Tiene 'gh') {
  gh auth status *> $null
  if ($LASTEXITCODE -ne 0) { Aviso 'gh sin sesion  -> gh auth login' } else { Ok 'gh con sesion' }
}
if (Tiene 'codex') {
  codex login status *> $null
  if ($LASTEXITCODE -ne 0) { Aviso 'codex sin sesion -> codex login' } else { Ok 'codex con sesion' }
}
if (Tiene 'gemini') {
  # Google retiro el nivel gratuito individual de Gemini CLI (IneligibleTierError): solo sirve con GEMINI_API_KEY.
  if ($env:GEMINI_API_KEY) { Ok 'gemini con GEMINI_API_KEY' }
  else { Aviso 'gemini NO funciona con cuenta Google gratuita; solo con GEMINI_API_KEY en .env (delegar.ps1 lo salta si falla)' }
}
if (Tiene 'opencode') { Write-Host '[..] opencode: si pide proveedor, usa opencode auth login (o modelos gratuitos incluidos).' }
Write-Host ''
Write-Host 'Si algun comando recien instalado no aparece, abre una terminal nueva.'
exit 0

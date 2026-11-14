<#
.SYNOPSIS
  Delega una tarea a un agente externo gratuito en modo no interactivo.
.DESCRIPTION
  Con -Agente auto prueba codex, opencode, gemini y ollama (en ese orden) y usa el primero
  que responda. Guarda la respuesta en un archivo y tambien la imprime.
  Devuelve codigo de salida distinto de 0 si ningun agente respondio.
.PARAMETER Tarea
  Texto de la tarea (posicional).
.PARAMETER Agente
  auto | codex | opencode | gemini | ollama
.PARAMETER Salida
  Ruta del archivo de respuesta. Por defecto .agentes/<fecha-hora>-<agente>.md
.PARAMETER Escritura
  Permite que el agente edite archivos. Por defecto es solo lectura.
.PARAMETER Modelo
  Modelo concreto (codex -m, opencode -m proveedor/modelo, gemini -m, ollama <modelo>).
.PARAMETER Timeout
  Segundos maximos por agente (por defecto 180).
.EXAMPLE
  scripts\delegar.ps1 "Resume docs/referencia/plan-radar-paceno.md en 5 puntos"
  scripts\delegar.ps1 "Responde solo: hola" -Agente ollama -Timeout 90
#>
param(
  [Parameter(Mandatory, Position = 0)][string]$Tarea,
  [ValidateSet('auto', 'codex', 'opencode', 'gemini', 'ollama')][string]$Agente = 'auto',
  [string]$Salida,
  [switch]$Escritura,
  [string]$Modelo,
  [int]$Timeout = 180
)

$ErrorActionPreference = 'Continue'
$raiz = Split-Path -Parent $PSScriptRoot
$orden = if ($Agente -eq 'auto') { @('codex', 'opencode', 'gemini', 'ollama') } else { @($Agente) }

function Tiene($c) { [bool](Get-Command $c -ErrorAction SilentlyContinue) }

# Mata un proceso y todos sus hijos (el timeout de un Job no mata los procesos nativos).
function Matar-Arbol($procId) {
  Get-CimInstance Win32_Process -Filter "ParentProcessId=$procId" -ErrorAction SilentlyContinue |
    ForEach-Object { Matar-Arbol $_.ProcessId }
  Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
}

function Limpiar($t) {
  if (-not $t) { return '' }
  $t = $t -replace "\x1B\[[0-9;?]*[ -/]*[@-~]", ''   # secuencias ANSI
  $t = $t -replace "\r", ''
  return $t.Trim()
}

# Ejecuta un agente. Devuelve @{Ok; Texto; Motivo}
function Invocar($nombre) {
  if (-not (Tiene $nombre)) { return @{ Ok = $false; Texto = ''; Motivo = 'no instalado' } }

  $tmpMsg = [IO.Path]::GetTempFileName()
  $mod = $Modelo
  $esc = [bool]$Escritura

  if ($nombre -eq 'ollama' -and -not $mod) {
    $mod = 'gemma3:4b'
    $lista = @(ollama list 2>$null | Select-Object -Skip 1 | ForEach-Object { ($_ -split '\s+')[0] } | Where-Object { $_ })
    if ($lista.Count -eq 0) { return @{ Ok = $false; Texto = ''; Motivo = 'ollama sin modelos (ollama pull gemma3:4b)' } }
    if ($lista -notcontains $mod) { $mod = $lista[0] }
  }

  $bloque = {
    param($nombre, $tarea, $mod, $esc, $dir, $msg)
    Set-Location $dir
    $ErrorActionPreference = 'Continue'
    switch ($nombre) {
      'codex' {
        $a = @('exec', '--skip-git-repo-check', '-o', $msg)
        $a += @('--sandbox', $(if ($esc) { 'workspace-write' } else { 'read-only' }))
        if ($mod) { $a += @('-m', $mod) }
        $a += $tarea
        $todo = & codex @a 2>&1
      }
      'opencode' {
        $a = @('run', '--standalone')
        # Por la restriccion de la NASA con entidades chinas (ver AGENTS.md) se fija un modelo gratuito no chino.
        $mOc = if ($mod) { $mod } else { 'opencode/nemotron-3.5-super-vl-free' }
        $a += @('-m', $mOc)
        if ($esc) { $a += '--auto' }
        $a += $tarea
        $todo = & opencode @a 2>&1
      }
      'gemini' {
        $a = @('--approval-mode', $(if ($esc) { 'auto_edit' } else { 'plan' }), '--skip-trust')
        if ($mod) { $a += @('-m', $mod) }
        $a += @('-p', $tarea)
        $todo = & gemini @a 2>&1
      }
      'ollama' {
        # ollama no edita archivos: -Escritura no aplica
        $todo = & ollama run $mod $tarea 2>&1
      }
    }
    $codigo = $LASTEXITCODE
    # separa stdout (cadenas) de stderr (ErrorRecord) sin que PowerShell trate stderr como error
    @{ Codigo = $codigo
       Out = (($todo | Where-Object { $_ -isnot [System.Management.Automation.ErrorRecord] }) | ForEach-Object { "$_" }) -join "`n"
       Err = (($todo | Where-Object { $_ -is [System.Management.Automation.ErrorRecord] }) | ForEach-Object { "$_" }) -join "`n" }
  }

  $inicio = (Get-Date).AddSeconds(-2)
  $job = Start-Job -ScriptBlock $bloque -ArgumentList $nombre, $Tarea, $mod, $esc, $raiz, $tmpMsg
  $fin = Wait-Job $job -Timeout $Timeout
  if (-not $fin) {
    # timeout: el Job corre en un powershell hijo de este proceso; matamos su arbol completo
    Get-CimInstance Win32_Process -Filter "ParentProcessId=$PID" -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -match "^(powershell|pwsh).exe$" -and $_.CreationDate -ge $inicio } |
      ForEach-Object { Matar-Arbol $_.ProcessId }
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -Force -ErrorAction SilentlyContinue
    return @{ Ok = $false; Texto = ''; Motivo = "timeout de $Timeout s" }
  }

  $res = Receive-Job $job -ErrorAction SilentlyContinue | Where-Object { $_ -is [hashtable] } | Select-Object -Last 1
  Remove-Job $job -Force -ErrorAction SilentlyContinue
  $codigo = if ($res) { $res.Codigo } else { -1 }

  $texto = ""
  if ($nombre -eq "codex" -and (Test-Path $tmpMsg) -and (Get-Item $tmpMsg).Length -gt 0) {
    $texto = Limpiar (Get-Content $tmpMsg -Raw -Encoding UTF8)
  }
  if (-not $texto -and $res) { $texto = Limpiar $res.Out }
  $err = if ($res) { Limpiar $res.Err } else { "" }
  Remove-Item $tmpMsg -Force -ErrorAction SilentlyContinue

  if ($codigo -ne 0 -or -not $texto) {
    $m = if ($err) { $l = @($err -split "`n" | Where-Object { $_ -match 'rror|login|auth|sesion' } | Select-Object -First 2); if (-not $l) { $l = @($err -split "`n" | Select-Object -Last 3) }; ($l | ForEach-Object { $_.Trim() }) -join ' | ' } else { "codigo de salida $codigo, sin texto" }
    if ($m.Length -gt 300) { $m = $m.Substring(0, 300) + '...' }
    return @{ Ok = $false; Texto = ''; Motivo = $m }
  }
  return @{ Ok = $true; Texto = $texto; Motivo = '' }
}

foreach ($ag in $orden) {
  Write-Host "[..] Probando $ag (timeout $Timeout s)..." -ForegroundColor Cyan
  $r = Invocar $ag
  if ($r.Ok) {
    $ruta = $Salida
    if (-not $ruta) {
      $dir = Join-Path $raiz '.agentes'
      New-Item -ItemType Directory -Force $dir | Out-Null
      $ruta = Join-Path $dir ("{0}-{1}.md" -f (Get-Date -Format 'yyyyMMdd-HHmmss'), $ag)
    } else {
      $padre = Split-Path -Parent $ruta
      if ($padre) { New-Item -ItemType Directory -Force $padre | Out-Null }
    }
    $r.Texto | Out-File $ruta -Encoding utf8
    Write-Host "[OK] Respondio $ag. Guardado en $ruta" -ForegroundColor Green
    Write-Host ''
    Write-Output $r.Texto
    exit 0
  }
  Write-Host "[!!] $ag no respondio: $($r.Motivo)" -ForegroundColor Yellow
}

Write-Host '[XX] Ningun agente respondio.' -ForegroundColor Red
exit 1

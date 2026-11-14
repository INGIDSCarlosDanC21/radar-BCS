<#
.SYNOPSIS
  Sincroniza el repo: fetch, actualiza dev, lista issues/PRs abiertos y handoffs recientes.
.PARAMETER Rol
  Filtra los issues por la etiqueta rol:<x> (p. ej. -Rol prog-b).
.EXAMPLE
  scripts\sync.ps1 -Rol lider
#>
param([string]$Rol)

$ErrorActionPreference = 'Continue'
$raiz = Split-Path -Parent $PSScriptRoot
Set-Location $raiz

function Titulo($t) { Write-Host ''; Write-Host "=== $t ===" -ForegroundColor Cyan }
function Aviso($m)  { Write-Host "[!!] $m" -ForegroundColor Yellow }

Titulo 'Git'
git fetch --all --prune 2>&1 | ForEach-Object { "$_" }
$rama = (git branch --show-current).Trim()
$sucio = @(git status --porcelain --untracked-files=no)
Write-Host "Rama actual: $rama"

if ($sucio.Count -gt 0) {
  Aviso "Hay $($sucio.Count) archivo(s) con cambios sin commit: NO se cambia de rama ni se actualiza."
  Aviso 'Haz commit o git stash y vuelve a correr scripts\sync.ps1.'
} else {
  if ($rama -ne 'dev') {
    git show-ref --verify --quiet refs/heads/dev
    if ($LASTEXITCODE -eq 0) { git switch dev 2>&1 | ForEach-Object { "$_" } }
    else { git switch -c dev --track origin/dev 2>&1 | ForEach-Object { "$_" } }
  }
  if ((git branch --show-current).Trim() -eq 'dev') {
    git pull --ff-only origin dev 2>&1 | ForEach-Object { "$_" }
    if ($LASTEXITCODE -ne 0) { Aviso 'No se pudo avanzar dev en fast-forward (historia divergente o sin remoto); revisa a mano.' }
  }
}

if (Get-Command gh -ErrorAction SilentlyContinue) {
  gh auth status *> $null
  if ($LASTEXITCODE -ne 0) {
    Aviso 'gh sin sesion -> ejecuta: gh auth login'
  } else {
    Titulo $(if ($Rol) { "Issues abiertos (etiqueta rol:$Rol)" } else { 'Issues abiertos' })
    if ($Rol) { gh issue list --state open --label "rol:$Rol" --limit 30 }
    else      { gh issue list --state open --limit 30 }
    Titulo 'Pull requests abiertos'
    gh pr list --state open --limit 30
  }
} else {
  Aviso 'gh no instalado: winget install GitHub.cli'
}

Titulo 'Ultimos cambios en docs/handoffs/'
if (Test-Path (Join-Path $raiz 'docs/handoffs')) {
  $log = git log -n 10 --date=format:'%d %b %H:%M' --pretty=format:'%ad  %an  %s' -- docs/handoffs 2>$null
  if ($log) { $log } else { Write-Host '(sin commits todavia en docs/handoffs)' }
  Write-Host ''
  Get-ChildItem docs/handoffs -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending |
    ForEach-Object { '{0:dd MMM HH:mm}  {1}' -f $_.LastWriteTime, $_.Name }
} else {
  Write-Host '(docs/handoffs/ aun no existe)'
}
exit 0

# Genera web/js/config.local.js a partir del .env de la raíz del repo.
# Variables: SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY. No imprime valores.
$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$envPath = Join-Path $raiz '.env'
if (-not (Test-Path $envPath)) { Write-Host 'Falta el archivo .env en la raíz del repo.'; exit 1 }

$vars = @{}
foreach ($linea in Get-Content $envPath -Encoding UTF8) {
  if ($linea -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
    $v = $Matches[2].Trim()
    if ($v.Length -ge 2 -and (($v[0] -eq '"' -and $v[-1] -eq '"') -or ($v[0] -eq "'" -and $v[-1] -eq "'"))) {
      $v = $v.Substring(1, $v.Length - 2)
    }
    $vars[$Matches[1]] = $v
  }
}

$faltan = @()
foreach ($n in 'SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY') {
  if (-not $vars.ContainsKey($n) -or [string]::IsNullOrWhiteSpace($vars[$n])) { $faltan += $n }
}
if ($faltan.Count -gt 0) { Write-Host ('Falta en .env: ' + ($faltan -join ', ')); exit 1 }

$url = $vars['SUPABASE_URL']
$clave = $vars['SUPABASE_PUBLISHABLE_KEY']
if ($clave -match 'service_role' -or $clave.StartsWith('sb_secret_')) {
  Write-Host 'Me niego: la clave parece secreta (service_role o sb_secret_). Usa solo la clave publishable/anon.'
  exit 1
}
if ($url -notmatch '^https://') { Write-Host 'SUPABASE_URL debe empezar con https://'; exit 1 }

$esc = { param($s) $s.Replace('\', '\').Replace("'", "\'") }
$salida = Join-Path $PSScriptRoot '..\js\config.local.js'
$cuerpo = "// Generado por tools/generar-config.ps1. Ignorado por git. No editar a mano.`r`n" +
  "window.RB_CONFIG = { supabaseUrl: '" + (& $esc $url) + "', supabaseKey: '" + (& $esc $clave) + "' };`r`n"
[System.IO.File]::WriteAllText([System.IO.Path]::GetFullPath($salida), $cuerpo, (New-Object System.Text.UTF8Encoding($false)))
Write-Host 'ok: web/js/config.local.js generado.'

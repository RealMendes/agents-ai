# Instala os presets SDD em um harness DSH copiando presets/* para $DSH_HOME/.agent-presets/.
# Uso: ./scripts/install-presets.ps1   (opcional: -DshHome "C:\caminho\.dsh")
param([string]$DshHome = '')

$ErrorActionPreference = 'Stop'

if (-not $DshHome) { $DshHome = $env:DSH_HOME }
if (-not $DshHome) { $DshHome = Join-Path $HOME '.dsh' }

$src = Join-Path $PSScriptRoot '..\presets'
$dst = Join-Path $DshHome '.agent-presets'

if (-not (Test-Path $src)) { throw "Diretório presets não encontrado: $src" }
New-Item -ItemType Directory -Force -Path $dst | Out-Null

Get-ChildItem -Directory $src | ForEach-Object {
  Copy-Item -Recurse -Force -Path $_.FullName -Destination (Join-Path $dst $_.Name)
  Write-Host "instalado: $($_.Name)"
}
Write-Host "Concluído. Reinicie o harness para listar os novos presets."

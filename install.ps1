# Instalador do Graphos: instala o engine como comando global e opcionalmente prepara um projeto.
# Uso:
#   ./install.ps1                         instala o comando `graphos`
#   ./install.ps1 -Project C:\caminho     também prepara um projeto (graphos/, CLAUDE.md, .claude/)
param([string]$Project = '')

$ErrorActionPreference = 'Stop'
$repo = $PSScriptRoot
$home = Join-Path $HOME '.graphos'
$bin = Join-Path $home 'bin'

New-Item -ItemType Directory -Force -Path $home, $bin | Out-Null
Copy-Item -Force (Join-Path $repo 'engine\graphos.mjs') (Join-Path $home 'graphos.mjs')

$shim = Join-Path $bin 'graphos.cmd'
@'
@echo off
node "%~dp0..\graphos.mjs" %*
'@ | Set-Content -Encoding ascii $shim

Write-Host "Engine instalado em $home"
Write-Host "Adicione ao PATH (uma vez) e reinicie o terminal:"
Write-Host "  setx PATH `"$env:PATH;$bin`""

if ($Project) {
  New-Item -ItemType Directory -Force -Path $Project | Out-Null
  Copy-Item -Recurse -Force (Join-Path $repo 'graphos') (Join-Path $Project 'graphos')
  Copy-Item -Force (Join-Path $repo 'CLAUDE.md') (Join-Path $Project 'CLAUDE.md')
  $claude = Join-Path $Project '.claude'
  New-Item -ItemType Directory -Force -Path $claude | Out-Null
  foreach ($d in @('agents', 'skills', 'commands')) {
    if (Test-Path (Join-Path $repo $d)) { Copy-Item -Recurse -Force (Join-Path $repo $d) (Join-Path $claude $d) }
  }
  Write-Host "Projeto preparado em $Project"
}

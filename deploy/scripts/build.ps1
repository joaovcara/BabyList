#Requires -Version 5.1
<#
.SYNOPSIS
  Build das imagens Docker do BabyList.
#>
param(
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
)

$ErrorActionPreference = "Stop"
Set-Location $ProjectRoot

if (-not (Test-Path (Join-Path $ProjectRoot ".env"))) {
    throw "Arquivo .env não encontrado. Copie .env.example para .env antes do deploy."
}

Write-Host "==> Build Docker images..."
docker compose --env-file .env build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "==> Build concluído."

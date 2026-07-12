#Requires -Version 5.1
<#
.SYNOPSIS
  Deploy completo: gera web.config IIS, build Docker e sobe os containers.
#>
param(
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
Set-Location $ProjectRoot

if (-not (Test-Path (Join-Path $ProjectRoot ".env"))) {
    throw @"
Arquivo .env não encontrado.

  copy .env.example .env

Edite JWT_SECRET, APP_PORT e IIS_SITE_PATH antes de continuar.
"@
}

Write-Host "==> [1/4] Gerando web.config para IIS..."
& (Join-Path $PSScriptRoot "generate-webconfig.ps1") -ProjectRoot $ProjectRoot
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "==> [2/4] Copiando web.config para o IIS (se IIS_SITE_PATH definido)..."
& (Join-Path $PSScriptRoot "copy-webconfig-to-iis.ps1") -ProjectRoot $ProjectRoot
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (-not $SkipBuild) {
    Write-Host "==> [3/4] Build Docker..."
    docker compose --env-file .env build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
    Write-Host "==> [3/4] Build Docker (pulado)"
}

Write-Host "==> [4/4] Subindo containers..."
docker compose --env-file .env up -d
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Ler APP_PORT do .env para mensagem final
$appPort = "8081"
Get-Content ".env" | ForEach-Object {
    if ($_ -match '^\s*APP_PORT\s*=\s*(.+)$') { $appPort = $Matches[1].Trim() }
}

Write-Host ""
Write-Host "Deploy concluído!"
Write-Host "  Container:  http://127.0.0.1:$appPort  (teste local no servidor)"
Write-Host "  IIS (80):   configure o site para apontar ao web.config gerado"
Write-Host ""
Write-Host "Pré-requisitos IIS:"
Write-Host "  - URL Rewrite Module"
Write-Host "  - Application Request Routing (ARR) com proxy habilitado"
Write-Host "  - Site na porta 80 com pasta física = IIS_SITE_PATH do .env"
Write-Host ""
Write-Host "Logs: docker compose logs -f"

#Requires -Version 5.1
<#
.SYNOPSIS
  Copia web.config gerado para o diretório físico do site IIS.
#>
param(
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
)

$ErrorActionPreference = "Stop"

$envFile = Join-Path $ProjectRoot ".env"
if (-not (Test-Path $envFile)) {
    throw "Arquivo .env não encontrado. Execute: copy .env.example .env"
}

$iisSitePath = $null
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*IIS_SITE_PATH\s*=\s*(.+)$') {
        $iisSitePath = $Matches[1].Trim()
    }
}

if (-not $iisSitePath) {
    Write-Host "IIS_SITE_PATH não definido no .env — pulando cópia para o IIS."
    Write-Host "Defina IIS_SITE_PATH (ex: C:\inetpub\babylist) e execute novamente."
    exit 0
}

$source = Join-Path $ProjectRoot "deploy\iis\site\web.config"
if (-not (Test-Path $source)) {
    throw "web.config não gerado. Execute primeiro: npm run deploy:iis"
}

if (-not (Test-Path $iisSitePath)) {
    Write-Host "Criando diretório IIS: $iisSitePath"
    New-Item -ItemType Directory -Path $iisSitePath -Force | Out-Null
}

Copy-Item -Path $source -Destination (Join-Path $iisSitePath "web.config") -Force
Write-Host "web.config copiado para: $iisSitePath"

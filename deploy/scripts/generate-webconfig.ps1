#Requires -Version 5.1
<#
.SYNOPSIS
  Gera deploy/iis/site/web.config a partir do .env do projeto.
#>
param(
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
)

$ErrorActionPreference = "Stop"

function Read-DotEnv {
    param([string]$Path)
    $vars = @{}
    if (-not (Test-Path $Path)) {
        throw "Arquivo .env não encontrado em: $Path`nCopie .env.example para .env e configure APP_PORT e JWT_SECRET."
    }
    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if ($line -eq "" -or $line.StartsWith("#")) { return }
        $eq = $line.IndexOf("=")
        if ($eq -gt 0) {
            $key = $line.Substring(0, $eq).Trim()
            $val = $line.Substring($eq + 1).Trim()
            $vars[$key] = $val
        }
    }
    return $vars
}

$envFile = Join-Path $ProjectRoot ".env"
$vars = Read-DotEnv -Path $envFile

$appPort = if ($vars["APP_PORT"]) { $vars["APP_PORT"] } else { "8080" }
$deployMode = if ($vars["IIS_DEPLOY_MODE"]) { $vars["IIS_DEPLOY_MODE"].ToLower() } else { "root" }
$subpath = if ($vars["IIS_SUBPATH"]) { $vars["IIS_SUBPATH"].Trim("/") } else { "babylist" }

if ($deployMode -eq "subfolder") {
    $templatePath = Join-Path $ProjectRoot "deploy\iis\web.config.subfolder.template"
} else {
    $templatePath = Join-Path $ProjectRoot "deploy\iis\web.config.template"
}

if (-not (Test-Path $templatePath)) {
    throw "Template não encontrado: $templatePath"
}

$content = Get-Content $templatePath -Raw -Encoding UTF8
$content = $content.Replace("__APP_PORT__", $appPort)
$content = $content.Replace("__IIS_SUBPATH__", $subpath)

$outDir = Join-Path $ProjectRoot "deploy\iis\site"
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$outFile = Join-Path $outDir "web.config"
[System.IO.File]::WriteAllText($outFile, $content, [System.Text.UTF8Encoding]::new($false))

Write-Host "web.config gerado: $outFile"
Write-Host "  APP_PORT     = $appPort"
Write-Host "  DEPLOY_MODE  = $deployMode"
if ($deployMode -eq "subfolder") {
    Write-Host "  IIS_SUBPATH  = /$subpath"
}

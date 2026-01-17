#!/usr/bin/env pwsh
param(
    [bool]$AutoApprove = $true
)

$ErrorActionPreference = "Stop"

function Require-Command {
    param([Parameter(Mandatory = $true)][string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' is not available in PATH. Install it and retry."
    }
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Require-Command -Name "terraform"

$initArgs = @("init", "-input=false")
$applyArgs = @("apply", "-input=false")


# Read CENTRAL_DNS from local central.env and pass as terraform variable
$centralEnvPath = Join-Path $scriptDir "central.env"
$CentralDns = $null
if (Test-Path $centralEnvPath) {
    foreach ($line in Get-Content $centralEnvPath) {
        if ($line -match '^\s*CENTRAL_DNS\s*=\s*(.+)\s*$') {
            $CentralDns = $Matches[1].Trim()
            break
        }
    }
}
if (-not $CentralDns) {
    throw "CENTRAL_DNS not found in $centralEnvPath"
}

$applyArgs += @('-var', "central_dns=$CentralDns")
# Read CENTRAL_DNS from local central.env and pass as terraform variable
$centralEnvPath = Join-Path $scriptDir "central.env"
$CentralDns = $null
if (Test-Path $centralEnvPath) {
    foreach ($line in Get-Content $centralEnvPath) {
        if ($line -match '^\s*CENTRAL_DNS\s*=\s*(.+)\s*$') {
            $CentralDns = $Matches[1].Trim()
            break
        }
    }
}
if (-not $CentralDns) {
    throw "CENTRAL_DNS not found in $centralEnvPath"
}

$applyArgs += @('-var', "central_dns=$CentralDns")

if ($AutoApprove) {
    $applyArgs += "-auto-approve"
}

Write-Host "Running: terraform $($initArgs -join ' ')" -ForegroundColor Cyan
terraform @initArgs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Running: terraform $($applyArgs -join ' ')" -ForegroundColor Cyan
terraform @applyArgs
exit $LASTEXITCODE

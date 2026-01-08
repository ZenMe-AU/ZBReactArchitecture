#!/usr/bin/env pwsh
param(
    [switch]$AutoApprove = $true
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

# if (-not (Test-Path (Join-Path $scriptDir "distribution.tf"))) {
#     throw "distribution.tf not found in $scriptDir. Generate it first."
# }

$initArgs = @("init", "-input=false")
$applyArgs = @("apply", "-input=false")

if ($AutoApprove) {
    $applyArgs += "-auto-approve"
}

Write-Host "Running: terraform $($initArgs -join ' ')" -ForegroundColor Cyan
terraform @initArgs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Running: terraform $($applyArgs -join ' ')" -ForegroundColor Cyan
terraform @applyArgs
exit $LASTEXITCODE

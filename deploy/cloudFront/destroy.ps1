#!/usr/bin/env pwsh
param(
    [switch]$AutoApprove
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

$destroyArgs = @("destroy", "-input=false")

if ($AutoApprove) {
    $destroyArgs += "-auto-approve"
}

Write-Host "Running: terraform $($destroyArgs -join ' ')" -ForegroundColor Yellow
terraform @destroyArgs
exit $LASTEXITCODE

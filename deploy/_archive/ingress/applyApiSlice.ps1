<#
Small helper to prepare TF var `target_env` for APIM API Terraform slice.

Usage:
  .\applyApiSlice.ps1 -TargetEnv chemicalfirefly
  .\applyApiSlice.ps1            # reads TARGET_ENV or target_env from .env

This sets the environment variable `TF_VAR_target_env` which Terraform
will pick up as `var.target_env` when `deploy.ps1` runs the apply.
#>

param(
    [string]$TargetEnv = "",
    [switch]$AutoDetect = $true
)

Set-StrictMode -Version Latest

function Read-DotEnv([string]$path) {
    if (-not (Test-Path $path)) { return @{} }
    $map = @{}
    Get-Content -Path $path | ForEach-Object {
        if (-not $_) { return }
        $line = $_.Trim()
        if ($line.StartsWith('#')) { return }
        $parts = $line.Split('=', 2)
        if ($parts.Count -eq 2) { $map[$parts[0].Trim()] = $parts[1].Trim() }
    }
    return $map
}

# Read .env from same folder as this script
$envFile = Join-Path $PSScriptRoot '.env'
$dot = Read-DotEnv $envFile

# Determine effective target env: param > .env TARGET_ENV > .env target_env > env var
$target = ''
if ($TargetEnv) { $target = $TargetEnv }
elseif ($dot.ContainsKey('TARGET_ENV') -and $dot['TARGET_ENV']) { $target = $dot['TARGET_ENV'] }
elseif ($dot.ContainsKey('target_env') -and $dot['target_env']) { $target = $dot['target_env'] }
elseif ($env:TARGET_ENV) { $target = $env:TARGET_ENV }

if ($AutoDetect -and -not $target) {
    # No strict autodetection implemented; leave empty so calling script can handle it
    Write-Host "No target env detected by applyApiSlice.ps1 (continue with empty TF_VAR_target_env)" -ForegroundColor Yellow
}

if ($target) {
    $env:TF_VAR_target_env = $target
    Write-Host "Set TF_VAR_target_env=$target" -ForegroundColor Green

    # Set APIM-related TF vars derived from the target env
    # apim_resource_group_name follows the pattern 'dev-<target>' (resource groups are prefixed with environment)
    $env:TF_VAR_apim_resource_group_name = "dev-$target"
    # apim_management_name follows the convention '<target>-apim'
    $env:TF_VAR_apim_management_name = "${target}-apim"
    Write-Host "Set TF_VAR_apim_resource_group_name=$($env:TF_VAR_apim_resource_group_name)" -ForegroundColor Green
    Write-Host "Set TF_VAR_apim_management_name=$($env:TF_VAR_apim_management_name)" -ForegroundColor Green
}
else {
    # Ensure variables are unset rather than left to previous values
    Remove-Item Env:TF_VAR_target_env -ErrorAction SilentlyContinue
    Remove-Item Env:TF_VAR_apim_resource_group_name -ErrorAction SilentlyContinue
    Remove-Item Env:TF_VAR_apim_management_name -ErrorAction SilentlyContinue
}
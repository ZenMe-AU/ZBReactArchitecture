<#
Sets Terraform variables required by ingressProfile.tf so Terraform won't prompt during plan/apply.

Usage examples:
  pwsh -File ./applyProfileSlice.ps1 -TargetEnv dev
  pwsh -File ./applyProfileSlice.ps1 -TargetEnv dev -EnvType dev -ModuleName profile -AutoDetect
  pwsh -File ./applyProfileSlice.ps1 -TargetEnv dev -FunctionAppName my-func -ResourceGroupName dev-dev

Notes:
- This script only sets TF_VAR_* environment variables in the current session.
- Then run deploy/ingress/build.ps1 and deploy/ingress/dist/deploy.ps1 in the same terminal session.
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory=$false)][string]$TargetEnv,
  [Parameter(Mandatory=$false)][string]$EnvType = 'dev',
  [Parameter(Mandatory=$false)][string]$ModuleName = 'profile',
  [Parameter(Mandatory=$false)][string]$SubscriptionId,
  [Parameter(Mandatory=$false)][string]$ResourceGroupName,
  [Parameter(Mandatory=$false)][string]$FunctionAppName,
  [switch]$AutoDetect = $true,
  [switch]$NoLogin
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Read-DotEnv([string]$path) {
  if (-not (Test-Path $path)) { return @{} }
  $map = @{}
  Get-Content -Path $path | ForEach-Object {
    if (-not $_) { return }
    $line = $_.Trim()
    if ($line.StartsWith('#')) { return }
    $parts = $line.Split('=',2)
    if ($parts.Count -eq 2) { $map[$parts[0].Trim()] = $parts[1].Trim() }
  }
  return $map
}

# Try to derive repo/deploy root to read deploy/.env for defaults
try {
  $repoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))))
} catch { $repoRoot = $null }

if ($repoRoot) {
  $deployRoot = Join-Path $repoRoot 'deploy'
  $wsenv = Read-DotEnv (Join-Path $deployRoot '.env')
} else {
  $wsenv = @{}
}

if (-not $TargetEnv) {
  if ($env:TARGET_ENV) { $TargetEnv = $env:TARGET_ENV }
  elseif ($wsenv.ContainsKey('TARGET_ENV')) { $TargetEnv = $wsenv['TARGET_ENV'] }
}
if (-not $TargetEnv) {
  throw "TargetEnv not provided and could not be inferred. Pass -TargetEnv <env>."
}

if (-not $ResourceGroupName) { $ResourceGroupName = "$EnvType-$TargetEnv" }

# Optional Azure login for autodetect
if ($AutoDetect -and -not $NoLogin) {
  try { az account show 1>$null 2>$null } catch { az login | Out-Null }
  if ($SubscriptionId) { az account set -s $SubscriptionId | Out-Null }
}

function Get-FunctionAppName([string]$rg, [string]$key) {
  try {
    $json = az functionapp list --resource-group $rg -o json 2>$null
    if (-not $json) { return $null }
    $apps = $json | ConvertFrom-Json
    if (-not $apps) { return $null }
    $candidates = @()
    $candidates += $apps | Where-Object { $_.name -like "$key*" }
    $candidates += $apps | Where-Object { $_.name -like "*${key}*" }
    $pref = $candidates | Where-Object { $_.name -match 'profile' }
    if ($pref) { return ($pref | Sort-Object name | Select-Object -First 1).name }
    if ($candidates) { return ($candidates | Sort-Object name | Select-Object -First 1).name }
    return $null
  } catch { return $null }
}

if (-not $FunctionAppName -and $AutoDetect) {
  $FunctionAppName = Get-FunctionAppName -rg $ResourceGroupName -key $TargetEnv
}

if (-not $FunctionAppName) {
  throw "FunctionAppName could not be determined. Pass -FunctionAppName <name> or enable -AutoDetect with proper Azure context."
}

# Export TF_VARs for this session
$env:TF_VAR_target_env = $TargetEnv
$env:TF_VAR_module_name = $ModuleName
$env:TF_VAR_resource_group_name = $ResourceGroupName
$env:TF_VAR_function_app_name = $FunctionAppName

# Sensible defaults for API route
if (-not $env:TF_VAR_enable_api_route) { $env:TF_VAR_enable_api_route = 'true' }
if (-not $env:TF_VAR_api_route_pattern) { $env:TF_VAR_api_route_pattern = '/api/profile/*' }
if (-not $env:TF_VAR_web_route_pattern) { $env:TF_VAR_web_route_pattern = '/profile/*' }

Write-Host "Set TF_VAR_target_env=$env:TF_VAR_target_env" -ForegroundColor Green
Write-Host "Set TF_VAR_module_name=$env:TF_VAR_module_name" -ForegroundColor Green
Write-Host "Set TF_VAR_resource_group_name=$env:TF_VAR_resource_group_name" -ForegroundColor Green
Write-Host "Set TF_VAR_function_app_name=$env:TF_VAR_function_app_name" -ForegroundColor Green
Write-Host "Set TF_VAR_enable_api_route=$env:TF_VAR_enable_api_route" -ForegroundColor DarkGreen
Write-Host "Set TF_VAR_api_route_pattern=$env:TF_VAR_api_route_pattern" -ForegroundColor DarkGreen
Write-Host "Set TF_VAR_web_route_pattern=$env:TF_VAR_web_route_pattern" -ForegroundColor DarkGreen

Write-Host "Profile ingress variables ready. Next:" -ForegroundColor Cyan
Write-Host "  1) Run deploy/ingress/build.ps1" -ForegroundColor Cyan
Write-Host "  2) Run deploy/ingress/dist/deploy.ps1 (same terminal)" -ForegroundColor Cyan

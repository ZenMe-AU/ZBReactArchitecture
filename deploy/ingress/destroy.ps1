<#!
Safely destroy all resources created by rgSlice (Front Door env slice).

Usage examples:
  pwsh -File ./destroyRgSlice.ps1 -AutoApprove               # Purges local TF artifacts by default
  pwsh -File ./destroyRgSlice.ps1 -NoPurge                   # Skip purging local TF artifacts
  pwsh -File ./destroyRgSlice.ps1 -SubscriptionId <sub> -EnvironmentKey willingworm -AutoApprove
  pwsh -File ./destroyRgSlice.ps1 -EnvironmentKey willingworm -CentralEnv root-zenblox -ParentDomainName zenblox.com.au -AutoApprove

Notes:
- Reads deploy/central.env for CENTRAL_ENV/CENTRAL_DNS when not provided.
- Ensures Azure subscription context unless -NoLogin is passed.
- Destroys everything tracked in this folder's Terraform state.
#>

[CmdletBinding()]
param(
  [string]$SubscriptionId,
  [switch]$NoLogin,
  [string]$EnvironmentKey = "willingworm",
  [string]$CentralEnv,
  [string]$ParentDomainName,
  [string]$DnsZoneResourceGroup,
  [string]$FrontDoorProfileName = "FrontDoor",
  [string]$FunctionAppName,
  [string]$ResourceGroupName,
  [switch]$AutoApprove,
  [switch]$NoPurge, # opt-out: do not remove local terraform artifacts
  [switch]$Purge    # backward-compatible opt-in (has no effect if -NoPurge is set)
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Ensure Azure login and subscription id
if (-not $NoLogin) {
  try { az account show 1>$null 2>$null } catch { az login | Out-Null }
}

if (-not $SubscriptionId) {
  $SubscriptionId = az account show --query id -o tsv
}
if (-not $SubscriptionId) {
  throw "No Azure subscription selected. Use 'az account set -s <sub>' or pass -SubscriptionId."
}
$env:ARM_SUBSCRIPTION_ID = $SubscriptionId
Write-Host "Using subscription: $SubscriptionId" -ForegroundColor DarkCyan

function Read-DotEnvFile {
  param([Parameter(Mandatory)][string]$Path)
  $result = @{}
  if (-not (Test-Path -Path $Path -PathType Leaf)) { return $result }
  Get-Content -Path $Path | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#')) {
      $kv = $line.Split('=',2)
      if ($kv.Count -eq 2) { $result[$kv[0].Trim()] = $kv[1].Trim() }
    }
  }
  return $result
}

Write-Host "==> Destroying rgSlice resources (env: $EnvironmentKey)" -ForegroundColor Cyan

# Resolve env files from this script directory (local central.env and .env)
$scriptDir = $PSScriptRoot
$centralEnvPath = Join-Path $scriptDir "central.env"
$dotEnvPath     = Join-Path $scriptDir ".env"

$centralVals = Read-DotEnvFile -Path $centralEnvPath
$dotVals     = Read-DotEnvFile -Path $dotEnvPath

# Merge central.env then .env (override on duplicate keys)
$envVals = @{}
foreach ($k in $centralVals.Keys) { $envVals[$k] = $centralVals[$k] }
foreach ($k in $dotVals.Keys)     { $envVals[$k] = $dotVals[$k] }

if (-not $CentralEnv -and $envVals.ContainsKey('CENTRAL_ENV')) { $CentralEnv = $envVals['CENTRAL_ENV'] }
if (-not $ParentDomainName -and $envVals.ContainsKey('CENTRAL_DNS')) { $ParentDomainName = $envVals['CENTRAL_DNS'] }

if (-not $CentralEnv) { throw "central_env not provided and CENTRAL_ENV not found in local central.env or .env" }
if (-not $ParentDomainName) { throw "parent_domain_name not provided and CENTRAL_DNS not found in local central.env or .env" }

# Export TF_VAR_* so terraform picks them up regardless of current shell
$env:TF_VAR_environment_key = $EnvironmentKey
$env:TF_VAR_central_env = $CentralEnv
$env:TF_VAR_parent_domain_name = $ParentDomainName
if ($DnsZoneResourceGroup) { $env:TF_VAR_dns_zone_resource_group = $DnsZoneResourceGroup }
$env:TF_VAR_frontdoor_profile_name = $FrontDoorProfileName

# Also prepare module slice variables if helper exists so destroy covers module resources
$applyProfileScript = Join-Path $scriptDir 'applyProfileSlice.ps1'
if (Test-Path -LiteralPath $applyProfileScript) {
  try {
    $envType = if ($dotVals.ContainsKey('ENV_TYPE')) { $dotVals['ENV_TYPE'] } else { 'dev' }
    Write-Host "Preparing module TF vars via applyProfileSlice.ps1..." -ForegroundColor DarkCyan
    $args = @('-TargetEnv', $EnvironmentKey, '-EnvType', $envType)
    if ($FunctionAppName) { $args += @('-FunctionAppName', $FunctionAppName) }
    if ($ResourceGroupName) { $args += @('-ResourceGroupName', $ResourceGroupName) } else { $args += @('-ResourceGroupName', "$envType-$EnvironmentKey") }
    if (-not $FunctionAppName) { $args += '-AutoDetect:$true' }
    & $applyProfileScript @args | Write-Output
  } catch {
    Write-Host "WARN: Failed to prepare module variables via applyProfileSlice.ps1 ($_)" -ForegroundColor Yellow
  }
} else {
  Write-Host "INFO: applyProfileSlice.ps1 not found; proceeding to destroy with env variables only." -ForegroundColor Yellow
}

Push-Location $scriptDir
try {
  # Ensure init
  Write-Host "-> terraform init" -ForegroundColor DarkCyan
  terraform init | Write-Output

  # Optional: brief login hint
  try { az account show 1>$null 2>$null } catch { Write-Host "(Hint) Run 'az login' if authentication fails during destroy." -ForegroundColor DarkYellow }

  $destroyArgs = @('destroy')
  if ($AutoApprove) { $destroyArgs += '-auto-approve' } else { Write-Host "You can pass -AutoApprove to skip prompts." -ForegroundColor DarkYellow }

  Write-Host "-> terraform $($destroyArgs -join ' ')" -ForegroundColor DarkCyan
  & terraform @destroyArgs

  Write-Host "rgSlice destroy finished." -ForegroundColor Green
  # Purge decision: default is to purge unless explicitly opted-out with -NoPurge
  $doPurge = $true
  if ($PSBoundParameters.ContainsKey('NoPurge') -and $NoPurge) { $doPurge = $false }
  if ($PSBoundParameters.ContainsKey('Purge') -and $Purge) { $doPurge = $true }

  if ($doPurge) {
    Write-Host "Purging local Terraform artifacts (.terraform/, state, lock, backup, plan)" -ForegroundColor DarkYellow
    $paths = @('.terraform', 'terraform.tfstate.d', '.terraform.lock.hcl', 'terraform.tfstate', 'terraform.tfstate.backup', 'tfplan', 'crash.log')
    foreach ($p in $paths) {
      if (Test-Path $p) {
        try {
          Remove-Item -Recurse -Force $p -ErrorAction Stop
        } catch {
          Write-Host ("Failed to remove {0}: {1}" -f $p, $_.Exception.Message) -ForegroundColor Red
        }
      }
    }
  } else {
    Write-Host "Skipping purge of local Terraform artifacts (requested -NoPurge)." -ForegroundColor DarkGray
  }
}
finally {
  Pop-Location
}

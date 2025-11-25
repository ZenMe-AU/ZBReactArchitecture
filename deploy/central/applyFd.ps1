<#
Apply central Front Door foundation (FdBase) with convenient parameters.

This is similar in behavior to deploy/frontdoorEnv/FdEnvSegment/applyRgSlice.ps1
but operates on the central Front Door Terraform in `deploy/central`.

Usage examples:
  pwsh -File ./applyFd.ps1
  pwsh -File ./applyFd.ps1 -AutoApprove:$false -PlanOnly
  pwsh -File ./applyFd.ps1 -SubscriptionId <subId> -CentralEnv my-central-rg -FrontDoorProfileName FrontDoor

Behavior:
- Ensures Azure CLI logged in and subscription selected
- Sets `ARM_SUBSCRIPTION_ID` for azurerm provider
- Reads defaults from `deploy/central.env` when available
- Builds Terraform -var list and runs `terraform init`, `terraform plan -out tfplan`, and `terraform apply tfplan` (unless `-PlanOnly`)
#>

[CmdletBinding()]
param(
  [string]$SubscriptionId,
  [string]$CentralEnv,
  [string]$FrontDoorProfileName,
  [string]$FrontDoorSkuName,
  [switch]$PlanOnly,
  [switch]$AutoApprove = $true,
  [switch]$NoLogin
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Ensures Azure login and subscription id, sets ARM_SUBSCRIPTION_ID
function Ensure-LoginAndSubscription {
  param([string]$SubscriptionId, [switch]$NoLogin)
  if (-not $NoLogin) {
    try { az account show 1>$null 2>$null } catch { az login | Out-Null }
  }
  if (-not $SubscriptionId) { $SubscriptionId = az account show --query id -o tsv }
  if (-not $SubscriptionId) { throw "No Azure subscription selected. Use 'az account set -s <sub>' or pass -SubscriptionId." }
  if (-not $env:ARM_SUBSCRIPTION_ID -or $env:ARM_SUBSCRIPTION_ID -ne $SubscriptionId) {
    $env:ARM_SUBSCRIPTION_ID = $SubscriptionId
    Write-Host "Using subscription: $SubscriptionId" -ForegroundColor DarkCyan
  }
  return $SubscriptionId
}

# Reads a .env-style file into a hashtable
function Read-DotEnv {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return @{} }
  $map = @{}
  Get-Content -Path $Path | ForEach-Object {
    if (-not $_) { return }
    $line = $_.Trim()
    if ($line.StartsWith('#')) { return }
    $parts = $line.Split('=',2)
    if ($parts.Count -eq 2) { $map[$parts[0].Trim()] = $parts[1].Trim() }
  }
  return $map
}

# Parses a boolean-like object into a proper boolean
# Builds Terraform -var list from parameters and central.env values (WAF removed)
function Build-VarList {
  param(
    [hashtable]$CentralEnvVals,
    [string]$CentralEnv,
    [string]$FrontDoorProfileName,
    [string]$FrontDoorSkuName
  )
  $vars = @()
  if ($CentralEnv) { $vars += @('-var', "central_env=$CentralEnv") }
  elseif ($CentralEnvVals.ContainsKey('CENTRAL_ENV') -and $CentralEnvVals['CENTRAL_ENV']) { $vars += @('-var', "central_env=$($CentralEnvVals['CENTRAL_ENV'])") }

  if ($FrontDoorProfileName) { $vars += @('-var', "frontdoor_profile_name=$FrontDoorProfileName") }
  if ($FrontDoorSkuName)     { $vars += @('-var', "frontdoor_sku_name=$FrontDoorSkuName") }
  return $vars
}

# Clears Terraform lock file if no terraform processes are running
function Clear-TerraformLockIfStale {
  $tfProcs = Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq 'terraform' }
  if (-not $tfProcs -and (Test-Path ".terraform.tfstate.lock.info")) { Remove-Item ".terraform.tfstate.lock.info" -Force }
}

function Terraform-Init { terraform init -input=false | Write-Output }

function Terraform-Plan {
  param([string[]]$Vars)
  $planArgs = @('plan','-out','tfplan') + $Vars
  Write-Host ("-> terraform {0}" -f ($planArgs -join ' ')) -ForegroundColor DarkCyan
  & terraform @planArgs
}

# Applies the Terraform plan
function Terraform-Apply {
  param([switch]$AutoApprove)
  $applyArgs = @('apply','-auto-approve','tfplan')
  if (-not $AutoApprove) { $applyArgs = @('apply','tfplan') }
  Write-Host ("-> terraform {0}" -f ($applyArgs -join ' ')) -ForegroundColor DarkCyan
  & terraform @applyArgs
}

Write-Host "==> Applying central Front Door (FdBase)" -ForegroundColor Cyan

$SubscriptionId = Ensure-LoginAndSubscription -SubscriptionId $SubscriptionId -NoLogin:$NoLogin

Push-Location $PSScriptRoot
try {
  # Restrict env file lookup to current script directory only
  $centralEnvPath = Join-Path $PSScriptRoot "central.env"
  $dotEnvPath     = Join-Path $PSScriptRoot ".env"

  $central = Read-DotEnv -Path $centralEnvPath
  $dotEnv  = Read-DotEnv -Path $dotEnvPath

  # Merge central.env and .env (values in .env override central.env if duplicate keys)
  $mergedEnv = @{}
  foreach ($k in $central.Keys) { $mergedEnv[$k] = $central[$k] }
  foreach ($k in $dotEnv.Keys)    { $mergedEnv[$k] = $dotEnv[$k] }

  $vars = Build-VarList -CentralEnvVals $mergedEnv -CentralEnv $CentralEnv -FrontDoorProfileName $FrontDoorProfileName -FrontDoorSkuName $FrontDoorSkuName

  Clear-TerraformLockIfStale
  Write-Host "-> terraform init" -ForegroundColor DarkCyan
  Terraform-Init

  Terraform-Plan -Vars $vars

  if (-not $PlanOnly) {
    Terraform-Apply -AutoApprove:$AutoApprove
    Write-Host "SUCCESS: Central Front Door apply complete." -ForegroundColor Green
  } else {
    Write-Host "INFO: Plan complete (no apply)." -ForegroundColor Yellow
  }
}
finally { Pop-Location }

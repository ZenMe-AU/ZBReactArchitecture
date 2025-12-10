<#!
Destroy central Front Door Terraform resources managed by this folder.

Usage:
  pwsh -File ./destroy.ps1
  pwsh -File ./destroy.ps1 -AutoApprove:$false
  pwsh -File ./destroy.ps1 -SubscriptionId <subId>

Behavior:
- Ensures Azure CLI logged in and subscription available (unless -NoLogin)
- Sets ARM_SUBSCRIPTION_ID for azurerm provider automatically
- Removes stale Terraform state lock if no terraform process is running
- Runs: terraform init; terraform destroy (auto-approve by default)
- Warns to destroy env slices first (they are separate state)
#>

[CmdletBinding()]
param(
  [string]$SubscriptionId,
  [string]$CentralEnv,
  [string]$FrontDoorProfileName,
  [string]$FrontDoorSkuName,
  [switch]$AutoApprove = $true,
  [switch]$NoLogin,
  [switch]$Force,
  [switch]$NoPurge,
  [switch]$Purge,
  [switch]$WaitForNoOps,
  [int]$WaitPollSeconds = 15,
  [int]$WaitTimeoutMinutes = 12
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host "==> Destroying central Terraform (FdBase)" -ForegroundColor Cyan

# Hint about env slices
if (-not $Force) {
  Write-Host "WARNING: If env slices exist (deploy/frontdoorEnv/*), destroy them first to avoid orphaned references." -ForegroundColor Yellow
}

# Ensure login/subscription
if (-not $NoLogin) {
  try { az account show 1>$null 2>$null } catch { az login | Out-Null }
}

if (-not $SubscriptionId) {
  $SubscriptionId = az account show --query id -o tsv
}
if (-not $SubscriptionId) {
  throw "No Azure subscription selected. Use 'az account set -s <sub>' or pass -SubscriptionId."
}

if (-not $env:ARM_SUBSCRIPTION_ID -or $env:ARM_SUBSCRIPTION_ID -ne $SubscriptionId) {
  $env:ARM_SUBSCRIPTION_ID = $SubscriptionId
  Write-Host "Using subscription: $SubscriptionId" -ForegroundColor DarkCyan
}

# Work in this folder
Push-Location $PSScriptRoot
try {
  # Read deploy/central.env for defaults (mirrors applyFd.ps1)
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

  # Restrict env file lookup to current script directory only (parity with applyFd.ps1)
  $centralEnvPath = Join-Path $PSScriptRoot "central.env"
  $dotEnvPath     = Join-Path $PSScriptRoot ".env"

  $central = Read-DotEnv $centralEnvPath
  $dotEnv  = Read-DotEnv $dotEnvPath

  # Merge central.env then .env (override on duplicate keys)
  $mergedEnv = @{}
  foreach ($k in $central.Keys) { $mergedEnv[$k] = $central[$k] }
  foreach ($k in $dotEnv.Keys)    { $mergedEnv[$k] = $dotEnv[$k] }

  # Compose -var arguments (central_env required by FdBase.tf validation)
  $vars = @()
  if ($PSBoundParameters.ContainsKey('CentralEnv') -and $CentralEnv) { $vars += @('-var', "central_env=$CentralEnv") }
  elseif ($mergedEnv.ContainsKey('CENTRAL_ENV') -and $mergedEnv['CENTRAL_ENV']) { $vars += @('-var', "central_env=$($mergedEnv['CENTRAL_ENV'])") }
  else { throw "central_env not provided and CENTRAL_ENV not found in local central.env or .env" }

  if ($PSBoundParameters.ContainsKey('FrontDoorProfileName') -and $FrontDoorProfileName) { $vars += @('-var', "frontdoor_profile_name=$FrontDoorProfileName") }
  if ($PSBoundParameters.ContainsKey('FrontDoorSkuName') -and $FrontDoorSkuName) { $vars += @('-var', "frontdoor_sku_name=$FrontDoorSkuName") }

  # Clear stale lock if no terraform process is running
  $tfProcs = Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq 'terraform' }
  if (-not $tfProcs -and (Test-Path ".terraform.tfstate.lock.info")) {
    Remove-Item ".terraform.tfstate.lock.info" -Force
  }

  # Optional wait loop to avoid 409 conflicts
  if ($WaitForNoOps) {
    if (-not $FrontDoorProfileName) { $FrontDoorProfileName = 'FrontDoor' }
    if (-not $CentralEnv -and $central.ContainsKey('CENTRAL_ENV')) { $CentralEnv = $central['CENTRAL_ENV'] }
    if (-not $CentralEnv) { Write-Host "WaitForNoOps: central env unknown; skipping wait." -ForegroundColor DarkGray }
    else {
      Write-Host ("Waiting for Front Door profile '{0}' in RG '{1}' to be free of in-progress operations..." -f $FrontDoorProfileName,$CentralEnv) -ForegroundColor DarkCyan
      $deadline = (Get-Date).AddMinutes($WaitTimeoutMinutes)
      $lastState = ''
      while ((Get-Date) -lt $deadline) {
        $afdInfo = az afd profile show -g $CentralEnv -n $FrontDoorProfileName --query provisioningState -o tsv 2>$null
        if (-not $afdInfo) { Write-Host "Profile not found (may already be deleted)." -ForegroundColor Yellow; break }
        $lastState = $afdInfo
        if ($afdInfo -in @('Succeeded','Failed')) { Write-Host "ProvisioningState=$afdInfo (ready)." -ForegroundColor DarkGreen; break }
        Write-Host "ProvisioningState=$afdInfo (waiting)..." -ForegroundColor DarkYellow
        Start-Sleep -Seconds $WaitPollSeconds
      }
      if ($lastState -notin @('Succeeded','Failed','')) { Write-Host "Timeout waiting for stable state; continuing with destroy." -ForegroundColor Yellow }
    }
  }

  Write-Host "-> terraform init" -ForegroundColor DarkCyan
  terraform init -input=false | Write-Output

  $destroyArgs = @('destroy') + $vars
  if ($AutoApprove) { $destroyArgs += '-auto-approve' }
  Write-Host "-> terraform $($destroyArgs -join ' ')" -ForegroundColor DarkCyan
  $prevEAP = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    $output = & terraform @destroyArgs 2>&1
  }
  finally {
    $ErrorActionPreference = $prevEAP
  }
  $exit = $LASTEXITCODE
  $outText = ($output | Out-String)
  $skipPurgeOnBusy = $false
  if ($exit -ne 0) {
    $isBusy409 = ($outText -match '409' -or $outText -match 'another operation is in progress')
    if ($isBusy409) {
      Write-Host "Azure is still processing a previous operation on the Front Door (HTTP 409)." -ForegroundColor Yellow
      Write-Host "wait a few minutes and re-run destroy or verify with:" -ForegroundColor Yellow
      Write-Host "  az afd profile show -g <rg> -n <name> -o table" -ForegroundColor DarkGray
      # Treat as non-fatal and avoid purging local TF artifacts to retain state
      $skipPurgeOnBusy = $true
    } else {
      Write-Host "Terraform destroy reported an error (exit $exit)." -ForegroundColor Red
      Write-Host "Tip: 'context deadline exceeded' can occur while Azure completes deletion in the background." -ForegroundColor Yellow
      Write-Host "Next: wait a few minutes, verify the profile exists with: az afd profile show -g <rg> -n <name>, then re-run destroy if still present." -ForegroundColor Yellow
      exit $exit
    }
  }

  # Purge local Terraform artifacts by default (opt-out with -NoPurge; force with -Purge)
  $doPurge = $true
  if ($PSBoundParameters.ContainsKey('NoPurge') -and $NoPurge) { $doPurge = $false }
  if ($PSBoundParameters.ContainsKey('Purge') -and $Purge) { $doPurge = $true }
  if ($doPurge -and -not $skipPurgeOnBusy) {
    Write-Host "Purging local Terraform artifacts (.terraform/, state, lock, plan)" -ForegroundColor DarkYellow

    function Remove-ItemRobust {
      param([string]$Path,[int]$Retries=6,[int]$DelayMs=600)
      if (-not (Test-Path $Path)) { return $true }
      for ($i=1; $i -le $Retries; $i++) {
        try {
          if (Test-Path $Path -PathType Container) {
            Get-ChildItem -LiteralPath $Path -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object { try { $_.Attributes='Normal' } catch {} }
          } else { try { (Get-Item -LiteralPath $Path -Force).Attributes='Normal' } catch {} }
          Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop
          return $true
        }
        catch {
          if ($i -lt $Retries) { Start-Sleep -Milliseconds $DelayMs; continue }
          $suffix = (Get-Date -Format 'yyyyMMddHHmmssfff')
          $renamed = "$Path._old_$suffix"
          try { Rename-Item -LiteralPath $Path -NewName (Split-Path -Leaf $renamed) -ErrorAction SilentlyContinue } catch {}
          if (Test-Path $renamed) { try { Remove-Item -LiteralPath $renamed -Recurse -Force -ErrorAction SilentlyContinue } catch {} }
          return ( -not (Test-Path $Path) )
        }
      }
    }

    $procs = Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq 'terraform' }
    if ($procs) {
      Write-Host "Waiting for terraform processes to exit before purge..." -ForegroundColor DarkGray
      foreach ($p in $procs) { try { Wait-Process -Id $p.Id -Timeout 8 -ErrorAction SilentlyContinue } catch {} }
    }

    $paths = @('.terraform','terraform.tfstate.d','.terraform.lock.hcl','terraform.tfstate','terraform.tfstate.backup','tfplan','crash.log')
    foreach ($p in $paths) {
      if (Test-Path $p) {
        $ok = Remove-ItemRobust -Path $p
        if (-not $ok -and (Test-Path $p)) { Write-Host ("Failed to remove {0}: locked" -f $p) -ForegroundColor Red }
      }
    }
  } else {
    Write-Host "Skipping purge of local Terraform artifacts (-NoPurge)." -ForegroundColor DarkGray
  }

  if ($skipPurgeOnBusy) {
    Write-Host "Central destroy in progress: Azure still busy (profile deletion queued)." -ForegroundColor Yellow
    exit 0
  } else {
    Write-Host "Central destroy complete." -ForegroundColor Green
  }
}
finally {
  Pop-Location
}

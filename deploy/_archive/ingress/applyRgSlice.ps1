<#
Apply Front Door env slice (FdEnvSegment) with convenient parameters.

Examples:
  pwsh -File ./apply.ps1 -EnvironmentKey willingworm
  pwsh -File ./apply.ps1 -EnvironmentKey willingworm -EnableCustomDomain:$false
  pwsh -File ./apply.ps1 -EnvironmentKey willingworm -ParentDomainName zenblox.com.au -DnsZoneResourceGroup root-zenblox
  pwsh -File ./apply.ps1 -SubscriptionId <subId> -PlanOnly

Notes:
- Central Front Door profile (name "FrontDoor") must exist already (deploy/central/applyFd.ps1)
- CENTRAL_ENV and (optionally) CENTRAL_DNS are read from deploy/central.env by Terraform
#>

[CmdletBinding()]
param(
  [string]$SubscriptionId,
  [string]$EnvironmentKey = "",
  [string]$ParentDomainName,
  [string]$DnsZoneResourceGroup,
  [string]$FrontDoorProfileName,
  [string]$RgApimGatewayHost = "",
  [Parameter(ValueFromPipelineByPropertyName=$true)] [object]$EnableRgWildcard = $true,
  [Parameter(ValueFromPipelineByPropertyName=$true)] [object]$EnableCustomDomain = $true,
  [Parameter(ValueFromPipelineByPropertyName=$true)] [object]$AutoDetect = $true,
  [switch]$PlanOnly,
  [switch]$AutoApprove = $true,
  [switch]$NoLogin
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host "==> Applying Front Door env slice (FdEnvSegment)" -ForegroundColor Cyan

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
  Write-Host "-> terraform init" -ForegroundColor DarkCyan
  terraform init -input=false | Write-Output

  function Parse-Bool([object]$v, [bool]$default) {
    if ($null -eq $v) { return $default }
    if ($v -is [bool]) { return [bool]$v }
    $s = $v.ToString().Trim().ToLower()
    switch ($s) {
      'true' { return $true }
      '$true' { return $true }
      '1' { return $true }
      'false' { return $false }
      '$false' { return $false }
      '0' { return $false }
      default { return $default }
    }
  }

  $EnableCustomDomainBool  = Parse-Bool $EnableCustomDomain  $true
  $AutoDetectBool          = Parse-Bool $AutoDetect          $true

  # Helper to read key=value files
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

  # Read env files from the same directory as this script
  $centralEnvPath = Join-Path $PSScriptRoot "central.env"
  $workspaceEnvPath = Join-Path $PSScriptRoot ".env"
  $central = Read-DotEnv $centralEnvPath
  $wsenv = Read-DotEnv $workspaceEnvPath

  # Compose -var arguments
  $vars = @()
  if ($EnvironmentKey)          { $vars += @('-var', "environment_key=$EnvironmentKey") }
  elseif ($wsenv.ContainsKey('TARGET_ENV') -and $wsenv['TARGET_ENV']) {
    $vars += @('-var', "environment_key=$($wsenv['TARGET_ENV'])")
  }
  if ($PSBoundParameters.ContainsKey('ParentDomainName') -and $ParentDomainName) {
    $vars += @('-var', "parent_domain_name=$ParentDomainName")
  }
  elseif ($central.ContainsKey('CENTRAL_DNS') -and $central['CENTRAL_DNS']) {
    $vars += @('-var', "parent_domain_name=$($central['CENTRAL_DNS'])")
  }
  if ($PSBoundParameters.ContainsKey('DnsZoneResourceGroup') -and $DnsZoneResourceGroup) {
    $vars += @('-var', "dns_zone_resource_group=$DnsZoneResourceGroup")
  }
  if ($PSBoundParameters.ContainsKey('FrontDoorProfileName') -and $FrontDoorProfileName) {
    $vars += @('-var', "frontdoor_profile_name=$FrontDoorProfileName")
  }
  if ($central.ContainsKey('CENTRAL_ENV') -and $central['CENTRAL_ENV']) {
    $vars += @('-var', "central_env=$($central['CENTRAL_ENV'])")
  }
  # Booleans must be 'true'/'false'
  $vars += @('-var', "enable_custom_domain=$($EnableCustomDomainBool.ToString().ToLower())")
    $EnableRgWildcardBool    = Parse-Bool $EnableRgWildcard    $true
    # Determine RG APIM gateway host: param override, TF_VAR, or default to <environment_key>-apim.azure-api.net
    if ($RgApimGatewayHost -and $RgApimGatewayHost.Trim() -ne '') {
      $rgApimHost = $RgApimGatewayHost.Trim()
    }
    elseif ($env:TF_VAR_rg_apim_gateway_host -and $env:TF_VAR_rg_apim_gateway_host.Trim() -ne '') {
      $rgApimHost = $env:TF_VAR_rg_apim_gateway_host.Trim()
    }
    else {
      # fall back to envKey from above or EnvironmentKey param
      $envKey = if ($EnvironmentKey) { $EnvironmentKey } elseif ($wsenv.ContainsKey('TARGET_ENV')) { $wsenv['TARGET_ENV'] } else { '' }
      if ($envKey -and $envKey.Trim() -ne '') { $rgApimHost = "${envKey}-apim.azure-api.net" } else { $rgApimHost = "" }
    }
    if ($rgApimHost -and $rgApimHost.Trim() -ne '') { $vars += @('-var', "rg_apim_gateway_host=$rgApimHost") }
    $vars += @('-var', "enable_rg_wildcard=$($EnableRgWildcardBool.ToString().ToLower())")

  # Auto-detect static web origin when requested
  if ($AutoDetectBool) {
    $envKey = if ($EnvironmentKey) { $EnvironmentKey } elseif ($wsenv.ContainsKey('TARGET_ENV')) { $wsenv['TARGET_ENV'] } else { '' }
    $envType = if ($wsenv.ContainsKey('ENV_TYPE')) { $wsenv['ENV_TYPE'] } else { 'dev' }
    if ($envKey) {
      # Resolve static website endpoint for web origin
      $list = & az storage account list -o json 2>$null
      if ($LASTEXITCODE -eq 0 -and $list) {
        try { $accts = $list | ConvertFrom-Json -ErrorAction Stop } catch { $accts = $null }
        if ($accts) {
          $cand = $accts | Where-Object { $_.name -like "*${envKey}*web*" } | Select-Object -First 1
          if ($cand) {
            $url = & az storage account show --name $cand.name --query primaryEndpoints.web -o tsv 2>$null
            if ($LASTEXITCODE -eq 0 -and $url) {
              try { $u = [System.Uri]::new($url); $webHost = $u.Host } catch { $webHost = $null }
              if ($webHost) { $vars += @('-var', "web_origin_host_override=$webHost") }
            }
          }
        }
      }
    }
  }

  $planArgs = @('plan','-out','tfplan') + $vars
  Write-Host ("-> terraform {0}" -f ($planArgs -join ' ')) -ForegroundColor DarkCyan
  & terraform @planArgs

  if (-not $PlanOnly) {
    $applyArgs = @('apply','-auto-approve','tfplan')
    if (-not $AutoApprove) { $applyArgs = @('apply','tfplan') }
    Write-Host ("-> terraform {0}" -f ($applyArgs -join ' ')) -ForegroundColor DarkCyan
    & terraform @applyArgs
    Write-Host "SUCCESS: Env slice apply complete." -ForegroundColor Green
  }
  else {
    Write-Host "INFO: Plan complete (no apply)." -ForegroundColor Yellow
  }
}
finally {
  Pop-Location
}

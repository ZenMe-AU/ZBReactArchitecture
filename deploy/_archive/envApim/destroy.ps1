<#
.SYNOPSIS
  Destroy Terraform-managed infrastructure for this APIM module.

.DESCRIPTION
  Runs `terraform init`, `terraform plan -destroy -out=tfdestroy`, and then applies the destroy plan.
  Use the -AutoApprove switch to skip interactive approval.

.EXAMPLE
  ./destroy.ps1 -AutoApprove
#>
param(
    [switch]$AutoApprove
)

Set-StrictMode -Version Latest

if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
    Write-Error "terraform executable not found in PATH. Install Terraform and retry."
    exit 1
}

$moduleDir = $PSScriptRoot
Push-Location $moduleDir
try {
    Write-Host "[destroy.ps1] Initializing Terraform in $moduleDir..."
    terraform init

    Write-Host "[destroy.ps1] Creating destroy plan..."
    terraform plan -destroy -out=tfdestroy

    # If Azure CLI is available, clear any service-level APIM policy that
    # might reference backends so backend deletion succeeds.
    if (Get-Command az -ErrorAction SilentlyContinue) {
        try {
            Write-Host "[destroy.ps1] Clearing APIM service-level policy (if present) via az CLI..."
            $azAccount = az account show --query id -o tsv 2>$null
            if ($LASTEXITCODE -eq 0 -and $azAccount) {
                $subscriptionId = $azAccount.Trim()
                $rg = "dev-chemicalfirefly"
                $service = "dev-chemicalfirefly-apim"
                $uri = "https://management.azure.com/subscriptions/$subscriptionId/resourceGroups/$rg/providers/Microsoft.ApiManagement/service/$service/policies/policy?api-version=2021-08-01"
                $body = '{"properties":{"format":"rawxml","value":"<policies><inbound><base /></inbound></policies>"}}'
                az rest --method put --uri $uri --body $body 2>$null | Out-Null
                Write-Host "[destroy.ps1] Service-level policy cleared (if it existed)."
            } else {
                Write-Host "[destroy.ps1] az account show failed; skipping service policy clear."
            }
        } catch {
            Write-Host "[destroy.ps1] Failed to clear service-level policy via az CLI: $_"
        }
    } else {
        Write-Host "[destroy.ps1] Azure CLI not found; skipping service-level policy clear."
    }

    # Destroy resources in a safe, targeted order to avoid dependency validation errors.
    $targets = @(
        "azurerm_api_management_api_operation_policy.catchall_get_policy",
        "azurerm_api_management_api_operation.catchall_get",
        "azurerm_api_management_api.http_api",
        "azurerm_api_management_diagnostic.apim_diag",
        "azurerm_api_management_logger.appinsights",
        "azurerm_api_management_backend.chemicalfirefly_profile_func",
        "azurerm_api_management.apim",
        "azurerm_role_assignment.user_apim_contributor",
        "time_sleep.wait_for_role"
    )

    foreach ($t in $targets) {
        Write-Host "[destroy.ps1] Attempting targeted destroy: $t"
        terraform destroy -target=$t -auto-approve 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[destroy.ps1] Targeted destroy failed for $t (continuing)."
        }
    }

    # Final full destroy to remove any remaining resources tracked in state.
    if ($AutoApprove) {
        Write-Host "[destroy.ps1] Final full destroy with -auto-approve..."
        terraform destroy -auto-approve
    } else {
        Write-Host "[destroy.ps1] Applying destroy plan (tfdestroy)..."
        terraform apply tfdestroy
    }
}
catch {
    Write-Error "[destroy.ps1] Error: $_"
    exit 1
}
finally {
    Pop-Location
}

Write-Host "[destroy.ps1] Done."

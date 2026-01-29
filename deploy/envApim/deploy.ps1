<#
.SYNOPSIS
  Initialize, plan, and apply Terraform for this APIM module.

.DESCRIPTION
  Runs `terraform init`, `terraform plan -out=tfplan`, and then applies the plan.
  Use the -AutoApprove switch to skip interactive approval.

.EXAMPLE
  ./deploy.ps1 -AutoApprove
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
    Write-Host "[deploy.ps1] Initializing Terraform in $moduleDir..."
    terraform init

    Write-Host "[deploy.ps1] Creating plan..."
    terraform plan -out=tfplan

    if ($AutoApprove) {
        Write-Host "[deploy.ps1] Applying with -auto-approve..."
        terraform apply -auto-approve
    } else {
        Write-Host "[deploy.ps1] Applying saved plan (tfplan)..."
        terraform apply tfplan
    }
}
catch {
    Write-Error "[deploy.ps1] Error: $_"
    exit 1
}
finally {
    Pop-Location
}

Write-Host "[deploy.ps1] Done."

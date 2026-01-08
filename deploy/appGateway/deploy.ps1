# Deploy Application Gateway infrastructure

$ErrorActionPreference = "Continue"

Write-Host "Deploying Application Gateway..." -ForegroundColor Cyan

# Load environment variables from .env files
$envVars = @{}

foreach ($envFile in @('.env', 'central.env')) {
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^\s*([^#][^=]+)=(.+)$') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()
                $envVars[$key] = $value
            }
        }
    }
}

# Build terraform variable arguments
$tfVars = @()
if ($envVars['TARGET_ENV']) { $tfVars += "-var", "environment_prefix=$($envVars['TARGET_ENV'])" }
if ($envVars['CENTRAL_ENV']) { $tfVars += "-var", "root_prefix=$($envVars['CENTRAL_ENV'])" }
if ($envVars['CENTRAL_DNS']) { 
    $domainName = $envVars['CENTRAL_DNS'] -replace '\.com\.au$', '' # Remove .com.au if present
    $tfVars += "-var", "domain_name=$domainName" 
}

terraform init
if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed during initialization!" -ForegroundColor Red
    exit $LASTEXITCODE
}

terraform plan @tfVars
if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed during planning!" -ForegroundColor Red
    exit $LASTEXITCODE
}

terraform apply @tfVars -auto-approve
if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Deployment complete!" -ForegroundColor Green

# Destroy Application Gateway infrastructure

$ErrorActionPreference = "Stop"

Write-Host "Destroying Application Gateway..." -ForegroundColor Red

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

# Ensure terraform is initialized
Write-Host "Initializing Terraform..."
terraform init
if ($LASTEXITCODE -ne 0) {
    Write-Host "terraform init failed" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Run non-interactive destroy first
Write-Host "Running terraform destroy (non-interactive)" -ForegroundColor Yellow
& terraform destroy -auto-approve @tfVars
if ($LASTEXITCODE -eq 0) {
    Write-Host "Destroy complete!" -ForegroundColor Green
    exit 0
}

Write-Host "Initial terraform destroy failed. Attempting remediation..." -ForegroundColor Yellow

# Determine resource group and application gateway name
$rg = if ($envVars['CENTRAL_ENV']) { $envVars['CENTRAL_ENV'] } else { 'root-zenblox' }
$agwName = "${rg}-appgatewayc"

# If terraform destroy failed, attempt to delete the Application Gateway via az CLI
try {
    if (Get-Command az -ErrorAction SilentlyContinue) {
        Write-Host "Attempting az CLI delete of Application Gateway '$agwName' in resource group '$rg'..." -ForegroundColor Yellow
        $subId = az account show --query id -o tsv 2>$null
        if ($LASTEXITCODE -ne 0 -or -not $subId) { $subArg = "" } else { $subArg = "--subscription $subId" }

        az network application-gateway delete --name $agwName --resource-group $rg $subArg --yes 2>$null

        # Wait for deletion (up to 10 minutes)
        $maxWait = 600
        $wait = 0
        while ($wait -lt $maxWait) {
            Start-Sleep -Seconds 5
            $wait += 5
            az network application-gateway show --name $agwName --resource-group $rg $subArg 2>$null
            if ($LASTEXITCODE -ne 0) { break }
        }

        if ($wait -ge $maxWait) {
            Write-Host "Timed out waiting for Application Gateway deletion." -ForegroundColor Red
        } else {
            Write-Host "Application Gateway removed via az CLI; retrying terraform destroy..." -ForegroundColor Green
            & terraform destroy -auto-approve @tfVars
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Destroy complete after az remediation!" -ForegroundColor Green
                exit 0
            }
        }
    } else {
        Write-Host "az CLI not found. Cannot run remediation delete." -ForegroundColor Yellow
    }
} catch {
    Write-Host "az CLI remediation failed: $_" -ForegroundColor Yellow
}

Write-Host "Destroy failed after remediation attempts. Inspect Terraform output and Azure for stuck resources." -ForegroundColor Red
exit 1

# This script deploys the Function App by:
# 1. Building the environment (terraform).
# 2. Applying database security configurations.
# 3. Updating the database schema.
# 4. Deploying the Function App code.

# Define a script parameter named "type" (string).
# This allows the script to be called with -type <value>, e.g.: .\deployfullstack.ps1 -type dev
param(
    [string]$type
)
# If no type parameter is passed, try to read it from environment variable TF_VAR_env_type
# If still no value, or the value is not in the valid list, default to "dev"
# Set environment variable TF_VAR_env_type with the value
$validTypes = @("dev", "test", "prod")
if (-not $type) {
    $type = $env:TF_VAR_env_type
    if ($type) {
        Write-Output "type parameter not set, using TF_VAR_env_type environment variable value: $type"
    }
}
if (-not $type -or $type -notin $validTypes) {
    Write-Warning "type is not set to a valid value ($($validTypes -join ', ')). Defaulting to 'dev'."
    $type = "dev"
}
$env:TF_VAR_env_type = $type
Write-Output "TF_VAR_env_type was set to $env:TF_VAR_env_type"

# Set MODULE_FOLDER to one folder above the current directory
$env:MODULE_FOLDER = Resolve-Path -Path ".."
Write-Output "Set MODULE_FOLDER to $env:MODULE_FOLDER"
Set-Location $env:MODULE_FOLDER
npm install
if ($LASTEXITCODE -ne 0) { Write-Warning "Dependency installation failed" }

# Deploy the environment (infrastructure for Function App)
Write-Output "Deploying the Function App environment..."
Set-Location $env:MODULE_FOLDER\deploy\env
node ./deployEnvironment.js --auto-approve
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Configure database security for Function App
Write-Output "Applying database security settings..."
node ./databaseSecurity.js
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Update database schema for Function App
Write-Output "Updating database schema..."
Set-Location $env:MODULE_FOLDER\deploy\schema
node ./updateDbSchema.js
if ($LASTEXITCODE -ne 0) { Write-Warning "Update database schema failed" }

# initialize database with seed data
Write-Output "Initializing database with seed data..."
Set-Location $env:MODULE_FOLDER\deploy\schema
node ./initData.js
if ($LASTEXITCODE -ne 0) { Write-Warning "Initialize database with seed data failed" }

# Deploy Function App code
Write-Output "Deploying the Function App code..."
Set-Location $env:MODULE_FOLDER\deploy\code
node ./deploy.js
if ($LASTEXITCODE -ne 0) { Write-Warning "Deploy Function App code failed" }
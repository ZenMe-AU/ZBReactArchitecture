# This script deploys the Function App by:
# 1. Building the environment (terraform).
# 2. Applying database security configurations.
# 3. Updating the database schema.
# 4. Deploying the Function App code.

# Set ROOT_FOLDER to one folder above the current directory
$env:ROOT_FOLDER = Resolve-Path -Path ".."
Write-Output "Set ROOT_FOLDER to $env:ROOT_FOLDER"

# Deploy the environment (infrastructure for Function App)
Write-Output "Deploying the Function App environment..."
Set-Location $env:ROOT_FOLDER\deploy\env
node ./deployEnvironment.js --auto-approve

# Configure database security for Function App
Write-Output "Applying database security settings..."
node ./databaseSecurity.js

# Update database schema for Function App
Write-Output "Updating database schema..."
Set-Location $env:ROOT_FOLDER\deploy\schema
node ./updateDbSchema.js

# Deploy Function App code
Write-Output "Deploying the Function App code..."
Set-Location $env:ROOT_FOLDER\deploy\code
node ./deploy.js
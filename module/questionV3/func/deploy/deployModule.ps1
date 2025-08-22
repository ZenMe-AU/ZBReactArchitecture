# This script deploys the Function App by:
# 1. Building the environment (terraform).
# 2. Applying database security configurations.
# 3. Updating the database schema.
# 4. Deploying the Function App code.

# Set MODULE_FOLDER to one folder above the current directory
$env:MODULE_FOLDER = Resolve-Path -Path ".."
Write-Output "Set MODULE_FOLDER to $env:MODULE_FOLDER"

# Deploy the environment (infrastructure for Function App)
Write-Output "Deploying the Function App environment..."
Set-Location $env:MODULE_FOLDER\deploy\env
node ./deployEnvironment.js --auto-approve

# Configure database security for Function App
Write-Output "Applying database security settings..."
node ./databaseSecurity.js

# Update database schema for Function App
Write-Output "Updating database schema..."
Set-Location $env:MODULE_FOLDER\deploy\schema
node ./updateDbSchema.js

# Deploy Function App code
Write-Output "Deploying the Function App code..."
Set-Location $env:MODULE_FOLDER\deploy\code
node ./deploy.js
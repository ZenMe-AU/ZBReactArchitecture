# This runs the js files that runs the terraform files that deployes this module infrastructure and code.

# set a module root folder environment variable to one folder above the current folder.
$env:MODULE_ROOT_FOLDER = Resolve-Path -Path ".."
Write-Output "Set MODULE_ROOT_FOLDER to $env:MODULE_ROOT_FOLDER"


# Install dependencies
Write-Output "Installing dependencies..."
Set-Location $env:MODULE_ROOT_FOLDER
npm install

# Deploy the module environment infrastructure
Write-Output "Deploying the module environment infrastructure..."
Set-Location $env:MODULE_ROOT_FOLDER\deploy\env
node .\deployEnvironment.js

# Deploy the database security
Write-Output "Deploying the database security..."
Set-Location $env:MODULE_ROOT_FOLDER\deploy\env
node .\databaseSecurity.js

# Deploy the database schema
Write-Output "Deploying the database schema..."
Set-Location $env:MODULE_ROOT_FOLDER\deploy\env
node .\updateDbSchema.js

# Deploy the code
Write-Output "Deploying the code..."
Set-Location $env:MODULE_ROOT_FOLDER\deploy\

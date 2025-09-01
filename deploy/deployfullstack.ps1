# This script runs the js files that run terraform files to deploy the environment and code.

# Prerequisites:
# The identity doing this deployment must have the following permissions:
# + Owner on the Azure Subscription
# + App Configuration Data Owner for the Azure subscription
# + DbAdmin group membership for the relevant environment type e.g. DbAdmin-Dev, DbAdmin-Test, DbAdmin-Prod

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

# set a root folder environment variable to one folder above the current folder.
$env:ROOT_FOLDER = Resolve-Path -Path ".."
Write-Output "Set ROOT_FOLDER to $env:ROOT_FOLDER"
Set-Location $env:ROOT_FOLDER

# Ensure Node.js and npm is installed on Win and MacOs. If not, install with winget or homebrew.
# Check if Node.js and npm are installed
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
$npmInstalled = Get-Command npm -ErrorAction SilentlyContinue

if (-not $nodeInstalled -or -not $npmInstalled) {
    if ($IsWindows) {
        Write-Output "Node.js or npm not found. Installing Node.js using winget..."
        winget install OpenJS.NodeJS -e --silent
    } elseif ($IsMacOS) {
        Write-Output "Node.js or npm not found. Installing Node.js using Homebrew..."
        brew install node
    } else {
        Write-Warning "Unsupported OS for automatic Node.js installation. Please install Node.js manually."
        exit 1
    }
    # Re-check installation
    $nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
    $npmInstalled = Get-Command npm -ErrorAction SilentlyContinue
    if (-not $nodeInstalled -or -not $npmInstalled) {
        Write-Error "Node.js or npm installation failed. Please install them manually. Visit https://nodejs.org/en/download/ for installation instructions."
        exit 1
    }
} else {
    Write-Output "Node.js and npm are already installed."
}

# Ensure pnpm is installed
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Output "pnpm is not installed. Installing pnpm globally using npm..."
    npm install -g pnpm
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Error "pnpm installation failed. Please install pnpm manually."
        exit 1
    }
} else {
    Write-Output "pnpm is already installed."
}

# Install dependencies
pnpm install

#Initialise the resource group that will contain all components and setup minimal components to support the Terraform backend.
Write-Output "Initialise the resource group that will contain all components and setup minimal components to support the Terraform backend."
Set-Location $env:ROOT_FOLDER\deploy\initEnv
node ./initEnvironment.js  --auto-approve
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

#Deploy the main environment, databases, securitye, etc.
Write-Output "Deploy the main environment, databases, security, etc."
Set-Location $env:ROOT_FOLDER\deploy\deployEnv
node ./deployEnvironment.js --auto-approve
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

#Deploy the UI module
Write-Output "Deploy the UI module"
Set-Location $env:ROOT_FOLDER\ui\deploy\
./deployUi.ps1
if ($LASTEXITCODE -ne 0) { Write-Warning "UI deployment failed" }

# Deploy modules by looping through their paths
$modules = @(
    "questionV3",
    "profile"
)
foreach ($modulePath in $modules) {
    Write-Output "Deploy the $modulePath module"
    Set-Location  $env:ROOT_FOLDER\module\$modulePath\func\deploy
    ./deployModule.ps1
    if ($LASTEXITCODE -ne 0) { Write-Warning "Module $modulePath deployment failed" }
}

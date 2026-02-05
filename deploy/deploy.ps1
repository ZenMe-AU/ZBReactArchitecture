# This script runs the js files that run terraform files to deploy the environment and code.

# Prerequisites:
# The identity doing this deployment must have the following permissions:
# + Owner on the Azure Subscription
# + App Configuration Data Owner for the Azure subscription
# + DbAdmin group membership for the relevant environment type e.g. DbAdmin-Dev, DbAdmin-Test, DbAdmin-Prod

# Define a script parameter named "type" (string) and "Stages" (array of int).
# This allows the script to be called with -type <value>, e.g.: .\deploy.ps1 -type dev

# Usage:
# 1. Run all stages (default):
#    .\deploy.ps1
#    or .\deploy.ps1 -type dev
# 2. Run specific stages only (e.g., only 1, 3, 5):
#    .\deploy.ps1 -type dev -Stages 1,3,5
# 3. Run only stages 4~7 (Install-Dependencies will run automatically):
#    .\deploy.ps1 -Stages 4,5,6,7
# 4. Run a single stage:
#    .\deploy.ps1 -Stages 6
# - The -type parameter is optional, default is dev.
# - The -Stages parameter accepts a comma-separated list of numbers to specify which stages to run.
# - Stage0 (Set-TFEnvType, Set-RootFolder) will always run.
param(
    [string]$type = "dev",
    [int[]]$Stages
)
Set-StrictMode -Version Latest

Import-Module ./deploymentModule.psm1

# Stage0: Always run
# Set TF_VAR_env_type using modular function
Set-TFEnvType -type $type
# Set root folder using modular function
Set-RootFolder

# If no stages specified, run all 1~9
if (-not $Stages -or $Stages.Count -eq 0) {
    $Stages = 1..9
}

if ($Stages -contains 1) { Ensure-DscNodeAndNpm }
if ($Stages -contains 2) { Ensure-DscPnpm }
if ($Stages -contains 3) { Ensure-DscTerraform }
if ($Stages -contains 8) { Ensure-AwsCli }
if ($Stages -contains 9) { Ensure-AzCli }
# If any of 4~7 is selected, run Install-Dependencies (after stage 3, before stage 4)
if ($Stages | Where-Object { $_ -in 4..7 }) {
    Install-Dependencies
}
if ($Stages -contains 4) { Init-ResourceGroup }
if ($Stages -contains 5) { Deploy-MainEnv }
if ($Stages -contains 6) { Deploy-Modules }
if ($Stages -contains 7) { Deploy-Ui }

# # Stage1
# Ensure-DscNodeAndNpm
# # Stage2
# Ensure-DscPnpm
# # Stage3
# Ensure-DscTerraform
# #install dependencies when stage4-7
# Install-Dependencies
# # Stage4
# Init-ResourceGroup
# # Stage5
# Deploy-MainEnv
# # Stage6
# Deploy-Modules
# # Stage7
# Deploy-Ui

# # If no type parameter is passed, try to read it from environment variable TF_VAR_env_type
# # If still no value, or the value is not in the valid list, default to "dev"
# # Set environment variable TF_VAR_env_type with the value
# $validTypes = @("dev", "test", "prod")
# if (-not $type) {
#     $type = $env:TF_VAR_env_type
#     if ($type) {
#         Write-Output "type parameter not set, using TF_VAR_env_type environment variable value: $type"
#     }
# }
# if (-not $type -or $type -notin $validTypes) {
#     Write-Warning "type is not set to a valid value ($($validTypes -join ', ')). Defaulting to 'dev'."
#     $type = "dev"
# }
# $env:TF_VAR_env_type = $type
# Write-Output "TF_VAR_env_type was set to $env:TF_VAR_env_type"

# # set a root folder environment variable to one folder above the current folder.
# $env:ROOT_FOLDER = Resolve-Path -Path ".."
# Write-Output "Set ROOT_FOLDER to $env:ROOT_FOLDER"
# Set-Location $env:ROOT_FOLDER

# # Detect OS, Pre powershell 6
# if ($PSVersionTable.PSVersion.Major -lt 6) {
#     Write-Warning "You are using a version of powershell older than 6, upgrade when possible"
#     $IsWindows = $env:OS -eq 'Windows_NT'
#     $IsMacOS = $false
#     if ($env:OSTYPE -eq 'darwin') { $IsMacOS = $true }
#     elseif ((Get-Command uname -ErrorAction SilentlyContinue) -and (uname) -eq 'Darwin') { $IsMacOS = $true }

# }

# # Ensure Node.js and npm is installed on Win and MacOs. If not, install with winget or homebrew.
# # Check if Node.js and npm are installed
# $nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
# $npmInstalled = Get-Command npm -ErrorAction SilentlyContinue

# if (-not $nodeInstalled -or -not $npmInstalled) {
#     if ($IsWindows) {
#         Write-Output "Node.js or npm not found. Installing Node.js using winget..."
#         winget install OpenJS.NodeJS -e --silent
#     } elseif ($IsMacOS) {
#         Write-Output "Node.js or npm not found. Installing Node.js using Homebrew..."
#         brew install node
#     } else {
#         Write-Warning "Unsupported OS for automatic Node.js installation. Please install Node.js manually."
#         exit 1
#     }
#     # Get the updated path from environment
#     $Env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
#     # Re-check installation
#     $nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
#     $npmInstalled = Get-Command npm -ErrorAction SilentlyContinue
#     if (-not $nodeInstalled -or -not $npmInstalled) {
#         Write-Error "Node.js or npm installation failed. Please install them manually. Visit https://nodejs.org/en/download/ for installation instructions."
#         exit 1
#     }
# } else {
#     Write-Output "Node.js and npm are installed."
# }

# # Ensure Terraform is installed
# $terraformInstalled = Get-Command terraform -ErrorAction SilentlyContinue

# if (-not $terraformInstalled) {
#     if ($IsWindows) {
#         Write-Output "Terraform not found. Installing Terraform using winget..."
#         winget install HashiCorp.Terraform -e --silent
#     } elseif ($IsMacOS) {
#         Write-Output "Terraform not found. Installing Terraform using Homebrew..."
#         brew tap hashicorp/tap
#         brew install hashicorp/tap/terraform
#     } else {
#         Write-Warning "Unsupported OS for automatic Terraform installation. Please install Terraform manually."
#         exit 1
#     }
#     # Re-check installation
#     $terraformInstalled = Get-Command terraform -ErrorAction SilentlyContinue
#     if (-not $terraformInstalled) {
#         Write-Error "Terraform installation failed. Please install it manually. Visit https://www.terraform.io/downloads.html for instructions."
#         exit 1
#     }
# } else {
#     Write-Output "Terraform is already installed."
# }

# # Install dependencies
# pnpm install

# #Initialise the resource group that will contain all components and setup minimal components to support the Terraform backend.
# Write-Output "Initialise the resource group that will contain all components and setup minimal components to support the Terraform backend."
# Set-Location $env:ROOT_FOLDER\deploy\initEnv
# node ./initEnvironment.cjs  --auto-approve
# if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# #Deploy the main environment, databases, securitye, etc.
# Write-Output "Deploy the main environment, databases, security, etc."
# Set-Location $env:ROOT_FOLDER\deploy\deployEnv
# node ./deployEnvironment.js --auto-approve
# if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# # Deploy modules by looping through their paths
# $modules = @(
#     "profile",
#     "quest3Tier"
# )
# foreach ($modulePath in $modules) {
#     Write-Output "Deploy the $modulePath module"
#     Set-Location  $env:ROOT_FOLDER\module\$modulePath\func\deploy
#     ./deployModule.ps1
#     if ($LASTEXITCODE -ne 0) { Write-Warning "Module $modulePath deployment failed" }
# }

# #Deploy the UI module
# Write-Output "Deploy the UI module"
# Set-Location $env:ROOT_FOLDER\ui\deploy\
# ./deployUi.ps1
# if ($LASTEXITCODE -ne 0) { Write-Warning "UI deployment failed" }

# # #TODO: Run verification test to confirm the deployment succeeded.
# # node ./verify/verifyDeployment.js
# # if ($LASTEXITCODE -ne 0) { Write-Warning "Deploy Function App code failed" }

# function Ensure-Pnpm {
#     # Ensure pnpm is installed and setup
# if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
#     Write-Output "pnpm is not installed. Installing pnpm globally using npm..."
#     if ($IsMacOS) {
#         Write-Output "MacOS requires sudo to globally install: npm install -g pnpm"
#         Write-Output "Please enter your password."
#         sudo npm install -g pnpm
#     } else {
#         npm install -g pnpm
#     }
#     if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
#         Write-Error "pnpm installation failed. Please install pnpm manually."
#         exit 1
#     }
# }
#     Write-Output "pnpm is installed."
#     # Check if pnpm is properly set up by running 'pnpm setup'
#     try {
#         pnpm setup --help > $null 2>&1
#     } catch {
#         Write-Output "pnpm is installed but not properly set up. Running 'pnpm setup'..."
#         pnpm setup
#         if ($LASTEXITCODE -ne 0) {
#             Write-Error "pnpm setup failed. Please run 'pnpm setup' manually."
#             exit 1
#         }
#     }
#     Write-Output "Check pnpm version"
#     $pnpmRequiredVersion = [version]"10.20.0"
#     $pnpmVersionOutput = pnpm --version 2>$null
#     if ($pnpmVersionOutput) {
#         $pnpmVersion = [version]($pnpmVersionOutput.Trim())
#         if ($pnpmVersion -lt $pnpmRequiredVersion) {
#             Write-Output "pnpm version $pnpmVersion is less than required $pnpmRequiredVersion. Upgrading pnpm globally using npm..."
#             npm install -g pnpm
#             $pnpmVersionOutput = & pnpm --version 2>$null
#             $pnpmVersion = [version]($pnpmVersionOutput.Trim())
#             if ($pnpmVersion -lt $pnpmRequiredVersion) {
#                 Write-Error "pnpm upgrade failed or version is still less than $pnpmRequiredVersion. Please upgrade pnpm manually."
#                 exit 1
#             }
#         } else {
#             Write-Output "pnpm is installed and version $pnpmVersion meets the minimum required version $pnpmRequiredVersion."
#         }
#     }
# }
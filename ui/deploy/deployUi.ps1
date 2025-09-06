# This script deploys the ui workspace by:
# 1. Running js deployment scripts that use terraform to build the environment.
# 2. Deploying application code into the environment.

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
$env:UI_FOLDER = Resolve-Path -Path ".."
Write-Output "Set UI_FOLDER to $env:UI_FOLDER"
Set-Location $env:UI_FOLDER
pnpm install
if ($LASTEXITCODE -ne 0) { Write-Warning "Install Dependencies failed" }

#Deploy the ui environment(infra).
Write-Output "Deploy the ui environment"
Set-Location $env:UI_FOLDER\deploy\env
node ./deployEnvironment.js --auto-approve
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

#Deploy the application code
Write-Output "Deploy the application code"
Set-Location $env:UI_FOLDER\deploy\code
#node ./deploy.js
if ($LASTEXITCODE -ne 0) { Write-Warning "Deploy ui code failed" }
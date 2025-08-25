# This script deploys the ui workspace by:
# 1. Running js deployment scripts that use terraform to build the environment.
# 2. Deploying application code into the environment.

param(
    [string]$type
)
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
node ./deploy.js
if ($LASTEXITCODE -ne 0) { Write-Warning "Deploy ui code failed" }
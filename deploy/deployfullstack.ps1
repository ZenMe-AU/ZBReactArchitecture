# This script runs the js files that run terraform files to deploy the environment and code.
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

# if (-not $env:TF_VAR_env_type -or ($env:TF_VAR_env_type -notin @("dev", "test", "prod"))) {
#     Write-Warning "TF_VAR_env_type is not set to a valid value (dev, test, prod). Defaulting to 'dev'."
#     $env:TF_VAR_env_type = "dev"
# }
Write-Output "TF_VAR_env_type was set to $env:TF_VAR_env_type"

# set a root folder environment variable to one folder above the current folder.
$env:ROOT_FOLDER = Resolve-Path -Path ".."
Write-Output "Set ROOT_FOLDER to $env:ROOT_FOLDER"
Set-Location $env:ROOT_FOLDER
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
    # "questionV3"
    "questionV3",
    "profile"
)
foreach ($modulePath in $modules) {
    Write-Output "Deploy the $modulePath module"
    Set-Location  $env:ROOT_FOLDER\module\$modulePath\func\deploy
    ./deployModule.ps1
    if ($LASTEXITCODE -ne 0) { Write-Warning "Module $modulePath deployment failed" }
}
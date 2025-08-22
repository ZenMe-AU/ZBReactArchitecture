# This script runs the js files that run terraform files to deploy the environment and code.

# set a root folder environment variable to one folder above the current folder.
$env:ROOT_FOLDER = Resolve-Path -Path ".."
Write-Output "Set ROOT_FOLDER to $env:ROOT_FOLDER"

#Initialise the resource group that will contain all components and setup minimal components to support the Terraform backend.
Write-Output "Initialise the resource group that will contain all components and setup minimal components to support the Terraform backend."
Set-Location $env:ROOT_FOLDER\deploy\initEnv
node ./initEnvironment.js

#Deploy the main environment, databases, securitye, etc.
Write-Output "Deploy the main environment, databases, security, etc."
Set-Location $env:ROOT_FOLDER\deploy\deployEnv
node ./deployEnvironment.js

#Deploy the UI module
Write-Output "Deploy the UI module"
Set-Location $env:ROOT_FOLDER\ui\deploy\
./deployUi.ps1

# #Deploy the questionV3 module
# Write-Output "Deploy the question module"
# Set-Location $env:ROOT_FOLDER\module\questionV3\func\deploy
# ./deployModule.ps1


# Deploy modules by looping through their paths
$modules = @(
    "questionV3",
    "profile"
)
foreach ($modulePath in $modules) {
    Write-Output "Deploy the $modulePath module"
    Set-Location  $env:ROOT_FOLDER\module\$modulePath\func\deploy
    ./deployModule.ps1
}
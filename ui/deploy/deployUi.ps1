# This script deploys the ui workspace by:
# 1. Running js deployment scripts that use terraform to build the environment.
# 2. Deploying application code into the environment.

# set a root folder environment variable to one folder above the current folder.
$env:ROOT_FOLDER = Resolve-Path -Path ".."
Write-Output "Set ROOT_FOLDER to $env:ROOT_FOLDER"

#Deploy the ui environment(infra).
Write-Output "Deploy the ui environment"
Set-Location $env:ROOT_FOLDER\deploy\env
node ./deployEnvironment.js --auto-approve

#Deploy the application code
Write-Output "Deploy the application code"
Set-Location $env:ROOT_FOLDER\deploy\code
node ./deploy.js
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

# If no stages specified, run all 1~10
if (-not $Stages -or $Stages.Count -eq 0) {
    $Stages = 1..10
}

if ($Stages -contains 1) { Ensure-NodeAndNpm }
if ($Stages -contains 2) { Ensure-Pnpm }
if ($Stages -contains 3) { Ensure-AzCli }
if ($Stages -contains 4) { Ensure-AwsCli }
if ($Stages -contains 5) { Ensure-Terraform }
if ($Stages -contains 6) { Check-InitEnv }
if ($Stages -contains 7) { Install-Dependencies } # If any of 7~9 is selected, run Install-Dependencies
if ($Stages -contains 8) { Deploy-MainEnv }
if ($Stages -contains 9) { Deploy-Modules }
if ($Stages -contains 10) { Deploy-Ui }

if ($Stages -contains 21) { Ensure-Postgresql }

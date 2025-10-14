# This script runs the js files that run terraform files to deploy the environment and code.

# Prerequisites:
# The identity doing this deployment must have the following permissions:
# + Owner on the Azure Subscription
# + App Configuration Data Owner for the Azure subscription
# + DbAdmin group membership for the relevant environment type e.g. DbAdmin-Dev, DbAdmin-Test, DbAdmin-Prod

# Define a script parameter named "type" (string).
# This allows the script to be called with -type <value>, e.g.: .\deployfullstack.ps1 -type dev
param(
    [string]$type = "dev"
)
Set-StrictMode -Version Latest
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
$env:ROOT_FOLDER = Resolve-Path -Path "..\.."
Write-Output "Set ROOT_FOLDER to $env:ROOT_FOLDER"
Set-Location $env:ROOT_FOLDER

# Detect OS, Pre powershell 6
if ($PSVersionTable.PSVersion.Major -lt 6) {
    Write-Warning "You are using a version of powershell older than 6, upgrade when possible"
    $IsWindows = $env:OS -eq 'Windows_NT'
    $IsMacOS = $false
    if ($env:OSTYPE -eq 'darwin') { $IsMacOS = $true }
    elseif ((Get-Command uname -ErrorAction SilentlyContinue) -and (uname) -eq 'Darwin') { $IsMacOS = $true }

}

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
    # Get the updated path from environment
    $Env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
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

# get TARGET_ENV from environment variable or $env:ROOT_FOLDER\.env file
try {
    $envFilePath = Join-Path -Path ($env:ROOT_FOLDER) -ChildPath "\deploy\.env"
    $envFilePath = Resolve-Path $envFilePath -ErrorAction Stop
    if (Test-Path $envFilePath) {
        $envContent = Get-Content $envFilePath -Raw
        $match = [regex]::Match($envContent, "^TARGET_ENV=(.+)$", [System.Text.RegularExpressions.RegexOptions]::Multiline)
        if ($match.Success) {
            $script:TARGET_ENV = $match.Groups[1].Value.Trim()
            Write-Output "Loaded TARGET_ENV from .env: $($script:TARGET_ENV)"
        }
    }
} catch {}

if (-not $script:TARGET_ENV) {
    throw "Error loading TARGET_ENV"
}

$script:ResourceGroupName = "${env:TF_VAR_env_type}-${script:TARGET_ENV}"
Write-Output "Resource group to delete: $script:ResourceGroupName"

# Delete the resource group and all resources in it.
az group delete --name $script:ResourceGroupName

# Delete the local terraform variables
Write-Output "Delete the local terraform variables."
Set-Location $env:ROOT_FOLDER\deploy\eraseAll
node ./cleanTerraformTemp.js
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Output "Finished deleting Resource group $script:ResourceGroupName and all its resources."
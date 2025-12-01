#
# @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
# @license SPDX-License-Identifier: MIT
#
# This module provide functions to set the desired state for local tools that allow the other scripts to function.
#

function Get-OsType {
    if ($PSVersionTable.PSVersion.Major -lt 6) {
        Write-Warning "You are using a version of powershell older than 6, upgrade when possible"
        Set-Variable -Name IsWindows -Value ($env:OS -eq 'Windows_NT') -Scope Script
        Set-Variable -Name IsMacOS -Value $false -Scope Script
        if ($env:OSTYPE -eq 'darwin') { Set-Variable -Name IsMacOS -Value $true -Scope Script }
        elseif ((Get-Command uname -ErrorAction SilentlyContinue) -and (uname) -eq 'Darwin') { Set-Variable -Name IsMacOS -Value $true -Scope Script }
    } else {
        # PowerShell 6+ (Core) cross-platform
        $isMac = [System.Runtime.InteropServices.RuntimeInformation]::IsOSPlatform([System.Runtime.InteropServices.OSPlatform]::OSX)
        Set-Variable -Name IsMacOS -Value $isMac -Scope Script
        $isWin = [System.Runtime.InteropServices.RuntimeInformation]::IsOSPlatform([System.Runtime.InteropServices.OSPlatform]::Windows)
        Set-Variable -Name IsWindows -Value $isWin -Scope Script
    }
}
# Determine the OS type and set variables in script scope
Get-OsType

function Ensure-DscPnpm {
    # Ensure pnpm is installed and setup
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Output "pnpm is not installed. Installing pnpm globally using npm..."
        if ($script:IsMacOS) {
            Write-Output "MacOS requires sudo to globally install: npm install -g pnpm"
            Write-Output "Please enter your password."
            sudo npm install -g pnpm
        } else {
            npm install -g pnpm
        }
        if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
            Write-Error "pnpm installation failed. Please install pnpm manually."
            exit 1
        }
    }
    Write-Output "pnpm is installed."
    # Check if pnpm is properly set up by running 'pnpm setup'
    try {
        pnpm setup --help > $null 2>&1
    } catch {
        Write-Output "pnpm is installed but not properly set up. Running 'pnpm setup'..."
        pnpm setup
        if ($LASTEXITCODE -ne 0) {
            Write-Error "pnpm setup failed. Please run 'pnpm setup' manually."
            exit 1
        }
    }
    Write-Output "Check pnpm version"
    $pnpmRequiredVersion = [version]"10.20.0"
    $pnpmVersionOutput = pnpm --version 2>$null
    if ($pnpmVersionOutput) {
        $pnpmVersion = [version]($pnpmVersionOutput.Trim())
        if ($pnpmVersion -lt $pnpmRequiredVersion) {
            Write-Output "pnpm version $pnpmVersion is less than required $pnpmRequiredVersion. Upgrading pnpm globally using npm..."
            npm install -g pnpm
            $pnpmVersionOutput = & pnpm --version 2>$null
            $pnpmVersion = [version]($pnpmVersionOutput.Trim())
            if ($pnpmVersion -lt $pnpmRequiredVersion) {
                Write-Error "pnpm upgrade failed or version is still less than $pnpmRequiredVersion. Please upgrade pnpm manually."
                exit 1
            }
        } else {
            Write-Output "pnpm is installed and version $pnpmVersion meets the minimum required version $pnpmRequiredVersion."
        }
    }
}

function Get-RootFolder {
    $env:ROOT_FOLDER = Resolve-Path -Path ".."
    Write-Output "Set ROOT_FOLDER to $env:ROOT_FOLDER"
    Set-Location $env:ROOT_FOLDER
}

# Ensure Node.js and npm is installed on Win and MacOs. If not, install with winget or homebrew.
# Check if Node.js and npm are installed
function Ensure-DscNodeAndNpm {
    $nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
    $npmInstalled = Get-Command npm -ErrorAction SilentlyContinue
    if (-not $nodeInstalled -or -not $npmInstalled) {
        if ($script:IsWindows) {
            Write-Output "Node.js or npm not found. Installing Node.js using winget..."
            winget install OpenJS.NodeJS -e --silent
        } elseif ($script:IsMacOS) {
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
        Write-Output "Node.js and npm are installed."
    }
}

# Ensure Terraform is installed
function Ensure-DscTerraform {
    $terraformInstalled = Get-Command terraform -ErrorAction SilentlyContinue
    if (-not $terraformInstalled) {
        if ($script:IsWindows) {
            Write-Output "Terraform not found. Installing Terraform using winget..."
            winget install HashiCorp.Terraform -e --silent
        } elseif ($script:IsMacOS) {
            Write-Output "Terraform not found. Installing Terraform using Homebrew..."
            brew tap hashicorp/tap
            brew install hashicorp/tap/terraform
        } else {
            Write-Warning "Unsupported OS for automatic Terraform installation. Please install Terraform manually."
            exit 1
        }
        # Re-check installation
        $terraformInstalled = Get-Command terraform -ErrorAction SilentlyContinue
        if (-not $terraformInstalled) {
            Write-Error "Terraform installation failed. Please install it manually. Visit https://www.terraform.io/downloads.html for instructions."
            exit 1
        }
    } else {
        Write-Output "Terraform is already installed."
    }
}

function Set-TFEnvType {
    param(
        [string]$type = "dev"
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
}

# set a root folder environment variable to one folder above the current folder.
function Set-RootFolder {
    $env:ROOT_FOLDER = Resolve-Path -Path ".."
    Write-Output "Set ROOT_FOLDER to $env:ROOT_FOLDER"
    Set-Location $env:ROOT_FOLDER
}

# Install dependencies
function Install-Dependencies {
    Write-Output "Install dependencies with pnpm install"
    pnpm install
}

#Initialise the resource group that will contain all components and setup minimal components to support the Terraform backend.
function Init-ResourceGroup {
    Write-Output "Initialise the resource group that will contain all components and setup minimal components to support the Terraform backend."
    Set-Location $env:ROOT_FOLDER\deploy\initEnv
    node ./initEnvironment.js --envDir="$env:ROOT_FOLDER/deploy" --auto-approve
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

#Deploy the main environment, databases, securitye, etc.
function Deploy-MainEnv {
    Write-Output "Deploy the main environment, databases, security, etc."
    Set-Location $env:ROOT_FOLDER\deploy\deployEnv
    node ./deployEnvironment.js --auto-approve
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

# Deploy modules by looping through their paths
function Deploy-Modules {
    $moduleRoot = Join-Path $env:ROOT_FOLDER 'module'
    $moduleFolders = Get-ChildItem -Path $moduleRoot -Directory | ForEach-Object { $_.Name }
    foreach ($modulePath in $moduleFolders) {
        Write-Output "Deploy the $modulePath module"
        $deployFolder = Join-Path $moduleRoot "$modulePath\func\deploy"
        if (Test-Path $deployFolder) {
            Set-Location $deployFolder
            if (Test-Path './deployModule.ps1') {
                ./deployModule.ps1
                if ($LASTEXITCODE -ne 0) { Write-Warning "Module $modulePath deployment failed" }
            } else {
                Write-Warning "deployModule.ps1 not found in $deployFolder"
            }
        } else {
            Write-Warning "Deploy folder not found for module $modulePath"
        }
    }
}

#Deploy the UI module
function Deploy-Ui {
    Write-Output "Deploy the UI module"
    $uiDeployFolder = Join-Path $env:ROOT_FOLDER 'ui/deploy'
    if (Test-Path $uiDeployFolder) {
        Set-Location $uiDeployFolder
        if (Test-Path './deployUi.ps1') {
            ./deployUi.ps1
            if ($LASTEXITCODE -ne 0) { Write-Warning "UI deployment failed" }
        } else {
            Write-Warning "deployUi.ps1 not found in $uiDeployFolder"
        }
    } else {
        Write-Warning "UI deploy folder not found: $uiDeployFolder"
    }
}

Export-ModuleMember -Function Ensure-DscPnpm,Get-RootFolder,Get-OsType,Ensure-DscNodeAndNpm,Ensure-DscTerraform,Set-TFEnvType,Set-RootFolder,Init-ResourceGroup,Deploy-MainEnv,Install-Dependencies,Deploy-Modules,Deploy-Ui

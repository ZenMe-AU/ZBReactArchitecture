#
# @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
# @license SPDX-License-Identifier: MIT
#
# This module provide functions to set the desired state for local tools that allow the other scripts to function.
#

function Ensure-DscPnpm {
    # Ensure pnpm is installed and setup
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Output "pnpm is not installed. Installing pnpm globally using npm..."
        npm install -g pnpm
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

function Get-OsType {
    if ($PSVersionTable.PSVersion.Major -lt 6) {
        Write-Warning "You are using a version of powershell older than 6, upgrade when possible"
        $IsWindows = $env:OS -eq 'Windows_NT'
        $IsMacOS = $false
        if ($env:OSTYPE -eq 'darwin') { $IsMacOS = $true }
        elseif ((Get-Command uname -ErrorAction SilentlyContinue) -and (uname) -eq 'Darwin') { $IsMacOS = $true }
    }
}

function Ensure-DscNodeAndNpm {
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
        $Env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
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

function Ensure-DscTerraform {
    $terraformInstalled = Get-Command terraform -ErrorAction SilentlyContinue
    if (-not $terraformInstalled) {
        if ($IsWindows) {
            Write-Output "Terraform not found. Installing Terraform using winget..."
            winget install HashiCorp.Terraform -e --silent
        } elseif ($IsMacOS) {
            Write-Output "Terraform not found. Installing Terraform using Homebrew..."
            brew tap hashicorp/tap
            brew install hashicorp/tap/terraform
        } else {
            Write-Warning "Unsupported OS for automatic Terraform installation. Please install Terraform manually."
            exit 1
        }
        $terraformInstalled = Get-Command terraform -ErrorAction SilentlyContinue
        if (-not $terraformInstalled) {
            Write-Error "Terraform installation failed. Please install it manually. Visit https://www.terraform.io/downloads.html for instructions."
            exit 1
        }
    } else {
        Write-Output "Terraform is already installed."
    }
}

Export-ModuleMember -Function Ensure-DscPnpm,Get-RootFolder,Get-OsType,Ensure-DscNodeAndNpm,Ensure-DscTerraform

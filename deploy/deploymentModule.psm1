#
# @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
# @license SPDX-License-Identifier: MIT
#
# This module provide functions to set the desired state for local tools that allow the other scripts to function.
#

function Initialize-PlatformState {
    if ($PSVersionTable.PSVersion.Major -lt 6) {
        Write-Warning "You are using a Windows only version of powershell, upgrade to Powerhsell Core when possible"
        Set-Variable -Name IsWindows -Value ($env:OS -eq 'Windows_NT') -Scope Script
        Set-Variable -Name IsMacOS -Value $false -Scope Script
        Set-Variable -Name IsUbuntu -Value $false -Scope Script
        if ($env:OSTYPE -eq 'darwin') { Set-Variable -Name IsMacOS -Value $true -Scope Script }
        elseif ((Get-Command uname -ErrorAction SilentlyContinue) -and (uname) -eq 'Darwin') { Set-Variable -Name IsMacOS -Value $true -Scope Script }
    } else {
        # PowerShell 6+ (Core) cross-platform means this could be Windows or any other OS that supports powershell core.
        # Check for Windows        
        $isWin = [System.Runtime.InteropServices.RuntimeInformation]::IsOSPlatform([System.Runtime.InteropServices.OSPlatform]::Windows)
        Set-Variable -Name IsWindows -Value $isWin -Scope Script

        # Check for MacOS
        $isMac = [System.Runtime.InteropServices.RuntimeInformation]::IsOSPlatform([System.Runtime.InteropServices.OSPlatform]::OSX)
        Set-Variable -Name IsMacOS -Value $isMac -Scope Script
        # Check for Ubuntu
        $isUbuntu = $false
        if (-not $isWin -and -not $isMac) {
            if ((Get-Command lsb_release -ErrorAction SilentlyContinue) -and ((& lsb_release '-is' 2>$null).Trim() -eq 'Ubuntu')) {
                $isUbuntu = $true
            } elseif (Test-Path '/etc/os-release') {
                $osRelease = Get-Content '/etc/os-release' -ErrorAction SilentlyContinue
                if ($osRelease -match '^ID=ubuntu$' -or $osRelease -match '^ID="ubuntu"$') {
                    $isUbuntu = $true
                }
            }
        }
        Set-Variable -Name IsUbuntu -Value $isUbuntu -Scope Script
        # Detect Apple Silicon (true even when running under Rosetta 2)
        $isAppleSilicon = $false
        if ($isMac) {
            $armSupport = & sysctl -n hw.optional.arm64 2>$null
            $isAppleSilicon = ($armSupport -eq "1")
        }
        Set-Variable -Name IsAppleSilicon -Value $isAppleSilicon -Scope Script


        $isLinux = [System.Runtime.InteropServices.RuntimeInformation]::IsOSPlatform([System.Runtime.InteropServices.OSPlatform]::Linux)
        Set-Variable -Name IsLinux -Value $isLinux -Scope Script

        # Ubuntu detection by reading /etc/os-release
        $isUbuntu = $false
        if ($isLinux) {
            try {
                $osRelease = Get-Content -Path /etc/os-release -ErrorAction SilentlyContinue -Raw
                if ($osRelease -and ($osRelease -match '(^|\n)ID=\"?ubuntu\"?(\n|$)' -or $osRelease -match 'Ubuntu')) {
                    $isUbuntu = $true
                }
            } catch { }
        }
        Set-Variable -Name IsUbuntu -Value $isUbuntu -Scope Script
    }
}
# Determine the OS type and set variables in script scope
Initialize-PlatformState

# Wrapper for brew that forces ARM64 mode on Apple Silicon to avoid Rosetta 2 conflicts
function Invoke-Brew {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
    if ($script:IsAppleSilicon) {
        arch -arm64 /opt/homebrew/bin/brew @Arguments
    } else {
        /usr/local/bin/brew @Arguments
    }
}

function Install-DevTools {
    Install-NodeJsAndNpm
    Install-Pnpm
    Install-Terraform
    Install-PostgreSql
    Install-AwsCli
    Install-AzureCli
    Install-GitHubCli
}

function Install-DevAiTools {
    Install-NodeJsAndNpm
    Install-Pnpm
    Install-Terraform
    Install-PostgreSql
    Install-AwsCli
    Install-AzureCli
    Install-Ripgrep
    Install-Fd
    Install-Jq
    Install-Yqi
    Install-GitHubCli
}

function Install-Pnpm {
    # Ensure pnpm is installed and setup
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Output "pnpm is not installed. Installing pnpm globally using npm..."
        if ($script:IsMacOS) {
            Write-Output "MacOS requires sudo to globally install: npm install -g pnpm"
            Write-Output "Please enter your password."
            sudo npm install -g pnpm
        } elseif ($script:IsUbuntu) {
            Write-Output "Ubuntu requires sudo to globally install pnpm: npm install -g pnpm"
            sudo npm install -g pnpm
        } else {
            npm install -g pnpm
        }
        if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
            Write-Error "pnpm installation failed. Please install pnpm manually."
            return 1
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
            return 1
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
                return 1
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

function Get-SudoPrefix {
    if ($env:USER -eq 'root') {
        return ''
    }
    return 'sudo '
}

# Ensure Node.js and npm is installed on Win and MacOs. If not, install with winget or homebrew.
# Check if Node.js and npm are installed
function Install-NodeJsAndNpm {
    $nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
    $npmInstalled = Get-Command npm -ErrorAction SilentlyContinue
    $requiredNodeVersion = [version]"22.0.0"
    $nodeNeedsInstallOrUpgrade = $false
    if (-not $nodeInstalled -or -not $npmInstalled) {
        $nodeNeedsInstallOrUpgrade = $true
        Write-Output "Node.js or npm not found. Will install Node.js."
    } else {
        # Check Node.js version
        try {
            $nodeVersionOutput = node --version 2>$null
            if ($nodeVersionOutput) {
                Write-Output "Node.js version output: $nodeVersionOutput"
                $nodeVersionString = $nodeVersionOutput.TrimStart("vV").Trim()
                $nodeVersion = [version]$nodeVersionString
                if ($nodeVersion -lt $requiredNodeVersion) {
                    Write-Output "Node.js version $nodeVersion is less than required $requiredNodeVersion. Will upgrade Node.js."
                    $nodeNeedsInstallOrUpgrade = $true
                } else {
                    Write-Output "Node.js version $nodeVersion meets the minimum required version $requiredNodeVersion."
                }
            } else {
                Write-Output "Unable to determine Node.js version. Will install Node.js."
                $nodeNeedsInstallOrUpgrade = $true
            }
        } catch {
            Write-Output "Error checking Node.js version. Will install Node.js."
            $nodeNeedsInstallOrUpgrade = $true
        }
    }

    if ($nodeNeedsInstallOrUpgrade) {
        if ($script:IsWindows) {
            Write-Output "Installing or upgrading Node.js using winget..."
            winget install OpenJS.NodeJS.22 -e --silent
        } elseif ($script:IsMacOS) {
            Write-Output "Installing or upgrading Node.js using Homebrew..."
            Invoke-Brew install node@22
            Invoke-Brew link --overwrite --force node@22
        } elseif ($script:IsUbuntu) {
            Write-Output "Installing or upgrading Node.js using NodeSource on Ubuntu..."
            $sudo = Get-SudoPrefix
            bash -lc @"
            sudo apt-get purge nodejs -y
            sudo apt-get autoremove -y
            $sudo apt-get update -y && $sudo apt-get install -y curl ca-certificates gnupg
            curl -fsSL https://deb.nodesource.com/setup_22.x | $sudo -E bash -
            $sudo apt-get install -y nodejs
            which node && node --version
"@
        } else {
            Write-Warning "Unsupported OS for automatic Node.js installation. Please install Node.js version 22 manually."
            return 1
        }
        # Get the updated path from environment
        $Env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
        # Re-check installation
        $nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
        $npmInstalled = Get-Command npm -ErrorAction SilentlyContinue
        if (-not $nodeInstalled -or -not $npmInstalled) {
            Write-Error "Node.js or npm installation failed. Please install them manually. Visit https://nodejs.org/en/download/ for installation instructions."
            return 1
        }
        # Confirm version
        $nodeVersionOutput = node --version 2>$null
        if ($nodeVersionOutput) {
            $nodeVersionString = $nodeVersionOutput.TrimStart("vV").Trim()
            $nodeVersion = [version]$nodeVersionString
            if ($nodeVersion -lt $requiredNodeVersion) {
                Write-Error "Node.js upgrade failed or version is still less than $requiredNodeVersion. Please upgrade Node.js manually."
                return 1
            }
        }
    }
    Write-Output "Node.js and npm are installed and meet the required version."
}

# Ensure Terraform is installed
function Install-Terraform {
    $terraformInstalled = Get-Command terraform -ErrorAction SilentlyContinue
    if (-not $terraformInstalled) {
        if ($script:IsWindows) {
            Write-Output "Terraform not found. Installing Terraform using winget..."
            winget install Hashicorp.Terraform -e --silent
        } elseif ($script:IsMacOS) {
            Write-Output "Terraform not found. Installing Terraform using Homebrew..."
            Invoke-Brew tap hashicorp/tap
            Invoke-Brew install hashicorp/tap/terraform
        } elseif ($script:IsUbuntu) {
            Write-Output "Terraform not found. Installing Terraform using apt on Ubuntu..."
            $sudo = Get-SudoPrefix
            bash -lc "$sudo apt-get update -y && $sudo apt-get install -y gnupg software-properties-common curl"
            bash -lc "curl -fsSL https://apt.releases.hashicorp.com/gpg | $sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg"
            bash -lc "echo 'deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main' | $sudo tee /etc/apt/sources.list.d/hashicorp.list"
            bash -lc "$sudo apt-get update -y && $sudo apt-get install -y terraform"
        } else {
            Write-Warning "Unsupported OS for automatic Terraform installation. Please install Terraform manually."
            return 1
        }
        # Re-check installation
        $terraformInstalled = Get-Command terraform -ErrorAction SilentlyContinue
        if (-not $terraformInstalled) {
            Write-Error "Terraform installation failed. Please install it manually. Visit https://www.terraform.io/downloads.html for instructions."
            return 1
        }
    } else {
        Write-Output "Terraform is already installed."
    }
}

function Install-PostgreSql {
    if ($script:IsWindows) {
        $postgresqlInstalled = (Get-Service *postgres* -ErrorAction SilentlyContinue).Count -gt 0
    } else {
        $postgresqlInstalled = Get-Command psql -ErrorAction SilentlyContinue
    }
    if (-not $postgresqlInstalled) {
        if ($script:IsWindows) {
            Write-Output "postgresql not found. Installing postgresql using winget..."
            winget install PostgreSQL.PostgreSQL -e --silent
        } elseif ($script:IsMacOS) {
            Write-Output "postgresql not found. Installing postgresql using Homebrew..."
            Invoke-Brew install postgresql
        } elseif ($script:IsUbuntu) {
            Write-Output "postgresql not found. Installing postgresql using apt on Ubuntu..."
            $sudo = Get-SudoPrefix
            bash -lc "$sudo apt-get update -y && $sudo apt-get install -y postgresql"
        } else {
            Write-Warning "Unsupported OS for automatic postgresql installation. Please install postgresql manually."
            return 1
        }
        # Re-check installation
        $postgresqlInstalled = Get-Command psql -ErrorAction SilentlyContinue
        if (-not $postgresqlInstalled) {
            Write-Error "postgresql installation failed. Please install it manually. Visit https://www.postgresql.org/download/ for instructions."
            return 1
        }
    } else {
        Write-Output "postgresql is already installed."
    }
}

# Ensures AWS CLI is installed, and installs if missing (Windows: winget, Mac: brew)
function Install-AwsCli {
    $awsCli = Get-Command aws -ErrorAction SilentlyContinue
    if (-not $awsCli) {
        if ($script:IsWindows) {
            Write-Output "AWS CLI not found. Installing AWS CLI using winget..."
            winget install Amazon.AWSCLI -e --silent
        } elseif ($script:IsMacOS) {
            Write-Output "AWS CLI not found. Installing AWS CLI using Homebrew..."
            Invoke-Brew install awscli
        } elseif ($script:IsUbuntu) {
            Write-Output "AWS CLI not found. Installing AWS CLI using apt on Ubuntu..."
            $sudo = Get-SudoPrefix
            bash -lc "$sudo apt-get update -y && $sudo apt-get install -y awscli"
        } else {
            Write-Warning "Unsupported OS for automatic AWS CLI installation. Please install AWS CLI manually."
            return 1
        }
        # Re-check installation
        $awsCli = Get-Command aws -ErrorAction SilentlyContinue
        if (-not $awsCli) {
            Write-Error "AWS CLI installation failed. Please install it manually. Visit https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html for instructions."
            return 1
        }
    } else {
        Write-Output "AWS CLI is already installed."
    }
}

# Ensures Azure CLI is installed, and installs if missing (Windows: winget, Mac: brew)
function Install-AzureCli {
    $azCli = Get-Command az -ErrorAction SilentlyContinue
    if (-not $azCli) {
        if ($script:IsWindows) {
            Write-Output "Azure CLI not found. Installing Azure CLI using winget..."
            winget install Microsoft.AzureCLI -e --silent
        } elseif ($script:IsMacOS) {
            Write-Output "Azure CLI not found. Installing Azure CLI using Homebrew..."
            Invoke-Brew install azure-cli
        } elseif ($script:IsUbuntu) {
            Write-Output "Azure CLI not found. Installing Azure CLI using apt on Ubuntu..."
            $sudo = Get-SudoPrefix
            bash -lc "curl -sL https://aka.ms/InstallAzureCLIDeb | $sudo bash"
        } else {
            Write-Warning "Unsupported OS for automatic Azure CLI installation. Please install Azure CLI manually."
            return 1
        }
        # Re-check installation
        $azCli = Get-Command az -ErrorAction SilentlyContinue
        if (-not $azCli) {
            Write-Error "Azure CLI installation failed. Please install it manually. Visit https://learn.microsoft.com/cli/azure/install-azure-cli for instructions."
            return 1
        }
    } else {
        Write-Output "Azure CLI is already installed."
    }

    # Ensure 'account' extension is installed
    try {
        $accountExt = az extension show --name account 2>$null
    } catch {
        $accountExt = $null
    }
    if (-not $accountExt) {
        Write-Output "Azure CLI 'account' extension not found. Installing..."
        az extension add --name account
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to install Azure CLI 'account' extension."
            return 1
        }
    } else {
        Write-Output "Azure CLI 'account' extension is already installed."
    }
}

# Ensures ripgrep (rg) is installed, and installs if missing (Windows: winget, Mac: brew)
function Install-Ripgrep {
    $rg = Get-Command rg -ErrorAction SilentlyContinue
    if (-not $rg) {
        if ($script:IsWindows) {
            Write-Output "ripgrep (rg) not found. Installing ripgrep using winget..."
            winget install -e --id BurntSushi.ripgrep.MSVC --verbose
            if ($LASTEXITCODE -eq -1978335189) { $LASTEXITCODE = 0 } # Ignore "Package is already installed" error
        } elseif ($script:IsMacOS) {
            Write-Output "ripgrep (rg) not found. Installing ripgrep using Homebrew..."
            Invoke-Brew install ripgrep
        } elseif ($script:IsUbuntu) {
            Write-Output "ripgrep (rg) not found. Installing ripgrep using apt on Ubuntu..."
            bash -lc "$sudo apt-get update -y && $sudo apt-get install -y ripgrep"
        } else {
            Write-Warning "Unsupported OS for automatic ripgrep installation. Please install ripgrep manually."
            return 1
        }
        Update-ProcessPathFromEnvironment
        # Re-check installation
        $rg = Get-Command rg -ErrorAction SilentlyContinue
        if (-not $rg) {
            Write-Error "ripgrep installation failed. Please install it manually. Visit https://github.com/BurntSushi/ripgrep for instructions."
            return 1
        }
    } else {
        Write-Output "ripgrep (rg) is already installed."
    }
}

# Ensures fd is installed, and installs if missing (Windows: winget, Mac: brew)
function Install-Fd {
    $fd = Get-Command fd -ErrorAction SilentlyContinue
    if (-not $fd) {
        if ($script:IsWindows) {
            Write-Output "fd not found. Installing fd using winget..."
            winget install sharkdp.fd -e --silent
            if ($LASTEXITCODE -eq -1978335189) { $LASTEXITCODE = 0 } # Ignore "Package is already installed" error
        } elseif ($script:IsMacOS) {
            Write-Output "fd not found. Installing fd using Homebrew..."
            Invoke-Brew install fd
        } elseif ($script:IsUbuntu) {
            Write-Output "fd not found. Installing fd using apt on Ubuntu..."
            bash -lc "$sudo apt-get update -y && $sudo apt-get install -y fd"
        } else {
            Write-Warning "Unsupported OS for automatic fd installation. Please install fd manually."
            return 1
        }
        Update-ProcessPathFromEnvironment
        # Re-check installation
        $fd = Get-Command fd -ErrorAction SilentlyContinue
        if (-not $fd) {
            Write-Error "fd installation failed. Please install it manually. Visit https://github.com/sharkdp/fd for instructions."
            return 1
        }
    } else {
        Write-Output "fd is already installed."
    }
}

# Ensures jq is installed, and installs if missing (Windows: winget, Mac: brew)
function Install-Jq {
    $jq = Get-Command jq -ErrorAction SilentlyContinue
    if (-not $jq) {
        if ($script:IsWindows) {
            Write-Output "jq not found. Installing jq using winget..."
            winget install jqlang.jq -e --silent
            if ($LASTEXITCODE -eq -1978335189) { $LASTEXITCODE = 0 } # Ignore "Package is already installed" error
        } elseif ($script:IsMacOS) {
            Write-Output "jq not found. Installing jq using Homebrew..."
            Invoke-Brew install jq
        } elseif ($script:IsUbuntu) {
            Write-Output "jq not found. Installing jq using apt on Ubuntu..."
            bash -lc "$sudo apt-get update -y && $sudo apt-get install -y jq"
        } else {
            Write-Warning "Unsupported OS for automatic jq installation. Please install jq manually."
            return 1
        }
        Update-ProcessPathFromEnvironment
        # Re-check installation
        $jq = Get-Command jq -ErrorAction SilentlyContinue
        if (-not $jq) {
            Write-Error "jq installation failed. Please install it manually. Visit https://jqlang.org/ for instructions."
            return 1
        }
    } else {
        Write-Output "jq is already installed."
    }
}

# Ensures yq is installed, and installs if missing (Windows: winget, Mac: brew)
function Install-Yq {
    $yq = Get-Command yq -ErrorAction SilentlyContinue
    if (-not $yq) {
        if ($script:IsWindows) {
            Write-Output "yq not found. Installing yq using winget..."
            winget install MikeFarah.yq -e --silent
            if ($LASTEXITCODE -eq -1978335189) { $LASTEXITCODE = 0 } # Ignore "Package is already installed" error
        } elseif ($script:IsMacOS) {
            Write-Output "yq not found. Installing yq using Homebrew..."
            Invoke-Brew install yq
        } elseif ($script:IsUbuntu) {
            Write-Output "yq not found. Installing yq using snap on Ubuntu..."
            bash -lc "$sudo snap install yq"
        } else {
            Write-Warning "Unsupported OS for automatic yq installation. Please install yq manually."
            return 1
        }
        Update-ProcessPathFromEnvironment
        # Re-check installation
        $yq = Get-Command yq -ErrorAction SilentlyContinue
        if (-not $yq) {
            Write-Error "yq installation failed. Please install it manually. Visit https://github.com/mikefarah/yq for instructions."
            return 1
        }
    } else {
        Write-Output "yq is already installed."
    }
}

# Ensures GitHub CLI (gh) is installed, and installs if missing (Windows: winget, Mac: brew)
function Install-GitHubCli {
    $gh = Get-Command gh -ErrorAction SilentlyContinue
    if (-not $gh) {
        if ($script:IsWindows) {
            Write-Output "GitHub CLI (gh) not found. Installing GitHub CLI using winget..."
            winget install GitHub.cli -e --silent
            if ($LASTEXITCODE -eq -1978335189) { $LASTEXITCODE = 0 } # Ignore "Package is already installed" error
        } elseif ($script:IsMacOS) {
            Write-Output "GitHub CLI (gh) not found. Installing GitHub CLI using Homebrew..."
            Invoke-Brew install gh
        } elseif ($script:IsUbuntu) {
            Write-Output "GitHub CLI (gh) not found. Installing GitHub CLI using apt on Ubuntu..."
            bash -lc "$sudo apt update && $sudo apt install gh"
        } else {
            Write-Warning "Unsupported OS for automatic GitHub CLI installation. Please install GitHub CLI manually."
            return 1
        }
        Update-ProcessPathFromEnvironment
        # Re-check installation
        $gh = Get-Command gh -ErrorAction SilentlyContinue
        if (-not $gh) {
            Write-Error "GitHub CLI installation failed. Please install it manually. Visit https://cli.github.com/ for instructions."
            return 1
        }
    } else {
        Write-Output "GitHub CLI (gh) is already installed."
    }
}

function Set-TerraformEnvironmentType {
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
function Set-ProjectRootFolder {
    $moduleFolder = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Path $MyInvocation.MyCommand.Path -Parent }
    $rootPath = Resolve-Path -Path (Join-Path $moduleFolder '..')
    $env:ROOT_FOLDER = $rootPath.Path
    Write-Output "Set ROOT_FOLDER to $env:ROOT_FOLDER"
    Set-Location $env:ROOT_FOLDER
}

# Install dependencies
function Install-ProjectDependencies {
    Write-Output "Install dependencies with pnpm install"
    pnpm install
}

#Initialise the resource group that will contain all components and setup minimal components to support the Terraform backend.
function Initialize-ResourceGroupBootstrap {
    Write-Output "Initialise the resource group that will contain all components and setup minimal components to support the Terraform backend."
    Set-Location $env:ROOT_FOLDER\deploy\initEnv
    node ./initEnvironment.cjs --envDir="$env:ROOT_FOLDER/deploy" --auto-approve
    if ($LASTEXITCODE -ne 0) { return $LASTEXITCODE }
}

#Deploy the main environment, databases, securitye, etc.
function Publish-MainEnvironment {
    Write-Output "Deploy the main environment, databases, security, etc."
    Set-Location $env:ROOT_FOLDER\deploy\deployEnv
    node ./deployEnvironment.js --auto-approve
    if ($LASTEXITCODE -ne 0) { return $LASTEXITCODE }
}

# Deploy modules by looping through their paths
function Publish-ModuleDeployments {
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
function Publish-UserInterface {
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

# Check if the .env file exists and contains the TARGET_ENV variable. If not, prompt the user to run initEnv.
function Test-InitializationEnvironment {
    Write-Output "Checking .env file"
    $envFile = Join-Path $env:ROOT_FOLDER "deploy\.env"
    if (-not (Test-Path $envFile)) {
        Write-Error ".env file not found. Please run initEnv manually."
        return 1
    }
    $content = Get-Content $envFile -Raw
    if ($content -notmatch "^TARGET_ENV\s*=\s*.+") {
        Write-Error "TARGET_ENV is missing or empty. Please run initEnv manually."
        return 1
    }
    $match = [regex]::Match($content, "^TARGET_ENV\s*=\s*(.+)", [System.Text.RegularExpressions.RegexOptions]::Multiline)
    $targetEnv = $match.Groups[1].Value.Trim()
    Write-Output ".env TARGET_ENV was set to $targetEnv"
}

function Update-ProcessPathFromEnvironment {
    if ($script:IsWindows) {
        $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
        $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
        $combinedPath = @($machinePath, $userPath) -join ";"
        if ($combinedPath) {
            $env:Path = $combinedPath
        }
        # Winget often shims executables in this folder for the current user.
        $wingetLinksPath = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Links"
        if ((Test-Path $wingetLinksPath) -and ($env:Path -notlike "*$wingetLinksPath*")) {
            $env:Path = "$env:Path;$wingetLinksPath"
        }
    }
}

Export-ModuleMember -Function Initialize-PlatformState,Install-Pnpm,Install-NodeJsAndNpm,Install-Terraform,Install-PostgreSql,Install-AwsCli,Install-AzureCli,Install-Ripgrep,Install-Fd,Install-Jq,Install-Yq,Install-GitHubCli,Set-TerraformEnvironmentType,Set-ProjectRootFolder,Install-ProjectDependencies,Initialize-ResourceGroupBootstrap,Publish-MainEnvironment,Publish-ModuleDeployments,Publish-UserInterface,Test-InitializationEnvironment,Install-DevTools,Install-DevAiTools

param(
    [string]$type = "dev",
    [int[]]$Stages
)

Set-StrictMode -Version Latest

# Ensure tooling module is available when running standalone
try {
    $modulePath = Join-Path $PSScriptRoot 'dscLocalDevTools.psm1'
    if (Test-Path -LiteralPath $modulePath) {
        Import-Module $modulePath -Force -ErrorAction Stop
        # Initialize OS flags used by the module (e.g., $IsWindows/$IsMacOS)
        Get-OsType
    } else {
        throw "Module not found at $modulePath"
    }
}
catch {
    Write-Error "Failed to load required module 'dscLocalDevTools.psm1': $_"
    exit 1
}

# Gate execution of apply script on successful dependency checks
$depChecksOk = $true

# Decide which dependency stages to run
if (-not $Stages -or $Stages.Count -eq 0) {
    $Stages = 1..3
}

try {
    if ($Stages -contains 1) { Ensure-DscNodeAndNpm }
    if ($Stages -contains 2) { Ensure-DscPnpm }
    if ($Stages -contains 3) { Ensure-DscTerraform }
}
catch {
    Write-Error "Dependency check failed: $_"
    $depChecksOk = $false
}

# Only run apply if all checks passed
if ($depChecksOk) {
    $applyScript = Join-Path $PSScriptRoot 'applyFd.ps1'
    if (Test-Path $applyScript) {
        Write-Host "Invoking applyFd.ps1..." -ForegroundColor Cyan
        & $applyScript
    }
    else {
        Write-Host "applyFd.ps1 not found in $PSScriptRoot" -ForegroundColor Red
    }
}
else {
    Write-Host "Skipping applyFd.ps1 due to failed dependency checks." -ForegroundColor Yellow
}


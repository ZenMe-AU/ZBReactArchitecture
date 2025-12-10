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
    # 1) Prepare module TF_VARs first if helper exists
    $applyProfileScript = Join-Path $PSScriptRoot 'applyProfileSlice.ps1'
    if (Test-Path $applyProfileScript) {
        Write-Host "Invoking applyProfileSlice.ps1 (preparing module variables)..." -ForegroundColor Cyan
        function Read-DotEnv([string]$path) {
            if (-not (Test-Path $path)) { return @{} }
            $map = @{}
            Get-Content -Path $path | ForEach-Object {
                if (-not $_) { return }
                $line = $_.Trim()
                if ($line.StartsWith('#')) { return }
                $parts = $line.Split('=',2)
                if ($parts.Count -eq 2) { $map[$parts[0].Trim()] = $parts[1].Trim() }
            }
            return $map
        }
        $localEnv = Read-DotEnv (Join-Path $PSScriptRoot '.env')
        $targetEnv = if ($localEnv.ContainsKey('TARGET_ENV')) { $localEnv['TARGET_ENV'] } else { $env:TARGET_ENV }
        $envType   = if ($localEnv.ContainsKey('ENV_TYPE'))   { $localEnv['ENV_TYPE'] }   else { 'dev' }
        if ($targetEnv) {
            & $applyProfileScript -TargetEnv $targetEnv -EnvType $envType -AutoDetect:$true
        } else {
            & $applyProfileScript -AutoDetect:$true
        }
    } else {
        Write-Host "applyProfileSlice.ps1 not found in $PSScriptRoot (skipping module variable setup)" -ForegroundColor Yellow
    }

    # 2) Apply environment Front Door slice
    $applyScript = Join-Path $PSScriptRoot 'applyRgSlice.ps1'
    if (Test-Path $applyScript) {
        Write-Host "Invoking applyRgSlice.ps1..." -ForegroundColor Cyan
        try {
            & $applyScript
        }
        catch {
            Write-Error "applyRgSlice.ps1 failed: $_"
        }
    }
    else {
        Write-Host "applyRgSlice.ps1 not found in $PSScriptRoot" -ForegroundColor Red
    }
}
else {
    Write-Host "Skipping apply scripts due to failed dependency checks." -ForegroundColor Yellow
}


# Create an empty external startup folder (FdStartUp) outside the repository root.
# Assumes script resides under <repo>/deploy/central/Build. Ascends to repo root then one level higher.
try {
    $repoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))  # build -> central -> deploy -> repo root
    $parentOfRepo = Split-Path -Parent $repoRoot
    if (-not $parentOfRepo) { $parentOfRepo = Split-Path -Parent $repoRoot }
    $fdStartupPath = 'dist'
    if (Test-Path $fdStartupPath) {
        throw "Directory '$fdStartupPath' already exists."
    } else {
        New-Item -ItemType Directory -Path $fdStartupPath -Force | Out-Null
    }
    Write-Host "External startup folder ready: $fdStartupPath" -ForegroundColor DarkCyan

    # Files to export from this folder into the external startup folder
    $filesToCopy = @('applyFd.ps1','destroy.ps1','FdBase.tf','README.md','deploy.ps1')
    foreach ($file in $filesToCopy) {
        $sourcePath = Join-Path $PSScriptRoot $file
        $destPath = Join-Path $fdStartupPath $file
        if (Test-Path -LiteralPath $sourcePath) {
            try {
                Copy-Item -LiteralPath $sourcePath -Destination $destPath -Force
                Write-Host "Copied $file" -ForegroundColor Green
            } catch {
                Write-Host "ERROR: Failed to copy $file ($_)." -ForegroundColor Red
            }
        } else {
            Write-Host "WARN: Source file not found: $sourcePath" -ForegroundColor Yellow
        }
    }
    # Also copy environment files: central.env and .env (both at deploy root) if present
    $deployRoot = Split-Path -Parent $PSScriptRoot  # central -> deploy
    $centralEnvSource = Join-Path $deployRoot 'central.env'
    $dotEnvSource = Join-Path $deployRoot '.env'
    $dependency = Join-Path $deployRoot 'dscLocalDevTools.psm1'
    $envFiles = @($centralEnvSource,$dotEnvSource,$dependency)
    foreach ($envFile in $envFiles) {
        if (Test-Path -LiteralPath $envFile) {
            try {
                $destPath = Join-Path $fdStartupPath (Split-Path -Leaf $envFile)
                Copy-Item -LiteralPath $envFile -Destination $destPath -Force
                Write-Host "Copied env file: $(Split-Path -Leaf $envFile)" -ForegroundColor Green
            } catch {
                Write-Host "ERROR: Failed to copy env file $(Split-Path -Leaf $envFile) ($_)." -ForegroundColor Red
            }
        } else {
            Write-Host "INFO: Env file not found (expected at $envFile)" -ForegroundColor Yellow
        }
    }

    Write-Host "Export complete. Files placed in $fdStartupPath" -ForegroundColor DarkCyan
} catch {
    Write-Host "INFO: Could not prepare external FdStartUp folder ($_)." -ForegroundColor Yellow
}
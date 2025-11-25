# Create an empty external startup folder (SliceStartUp) outside the repository root.
try {
    # From this script (deploy\ingress) the repo root is two levels up
    $repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)  # ingress -> deploy -> repo root
    $parentOfRepo = Split-Path -Parent $repoRoot
    if (-not $parentOfRepo) { $parentOfRepo = Split-Path -Parent $repoRoot }
    $SliceStartUp = 'dist'
    if (Test-Path $SliceStartUp) {
        throw "Directory '$SliceStartUp' already exists."
    } else {
        New-Item -ItemType Directory -Path $SliceStartUp -Force | Out-Null
    }
    Write-Host "External startup folder ready: $SliceStartUp" -ForegroundColor DarkCyan

    # Files to export from this folder into the external startup folder
    $filesToCopy = @('applyRgSlice.ps1','destroy.ps1','ingress.tf','README.md','deploy.ps1')
    foreach ($file in $filesToCopy) {
        $sourcePath = Join-Path $PSScriptRoot $file
        $destPath = Join-Path $SliceStartUp $file
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
    # Correct path from this script: -> deploy
    $deployRoot = Split-Path -Parent $PSScriptRoot
    $centralEnvSource = Join-Path $deployRoot 'central.env'
    $dotEnvSource = Join-Path $deployRoot '.env'
    $dependency = Join-Path $deployRoot 'dscLocalDevTools.psm1'
    $envFiles = @($centralEnvSource,$dotEnvSource,$dependency)
    foreach ($envFile in $envFiles) {
        if (Test-Path -LiteralPath $envFile) {
            try {
                $destPath = Join-Path $SliceStartUp (Split-Path -Leaf $envFile)
                Copy-Item -LiteralPath $envFile -Destination $destPath -Force
                Write-Host "Copied env file: $(Split-Path -Leaf $envFile)" -ForegroundColor Green
            } catch {
                Write-Host "ERROR: Failed to copy env file $(Split-Path -Leaf $envFile) ($_)." -ForegroundColor Red
            }
        } else {
            Write-Host "INFO: Env file not found (expected at $envFile)" -ForegroundColor Yellow
        }
    }

    # Also copy the Profile module ingress slice (ingressProfile.tf) into dist
    try {
        $profileIngressSource = Join-Path $repoRoot 'module\profile\func\deploy\ingress\ingressProfile.tf'
        if (Test-Path -LiteralPath $profileIngressSource) {
            $profileIngressDest = Join-Path $SliceStartUp 'ingressProfile.tf'
            Copy-Item -LiteralPath $profileIngressSource -Destination $profileIngressDest -Force
            Write-Host "Copied module ingressProfile.tf" -ForegroundColor Green
        } else {
            Write-Host "WARN: Module ingressProfile.tf not found: $profileIngressSource" -ForegroundColor Yellow
        }
        $profileApplySource = Join-Path $repoRoot 'module\profile\func\deploy\ingress\applyProfileSlice.ps1'
        if (Test-Path -LiteralPath $profileApplySource) {
            $profileApplyDest = Join-Path $SliceStartUp 'applyProfileSlice.ps1'
            Copy-Item -LiteralPath $profileApplySource -Destination $profileApplyDest -Force
            Write-Host "Copied module applyProfileSlice.ps1" -ForegroundColor Green
        } else {
            Write-Host "WARN: Module applyProfileSlice.ps1 not found: $profileApplySource" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "ERROR: Failed to copy module ingress/profile assets ($__)." -ForegroundColor Red
    }

    Write-Host "Export complete. Files placed in $SliceStartUp" -ForegroundColor DarkCyan
} catch {
    Write-Host "INFO: Could not prepare external SliceStartUp folder ($_)." -ForegroundColor Yellow
}
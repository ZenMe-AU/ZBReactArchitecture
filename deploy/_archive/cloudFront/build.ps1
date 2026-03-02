# Build script for Application Gateway deployment
# Creates a dist folder and copies deployment files

$ErrorActionPreference = "Stop"

$distPath = Join-Path $PSScriptRoot 'dist'

# Create dist folder
if (Test-Path $distPath) {
    Write-Host "Cleaning existing dist folder..." -ForegroundColor Yellow
    Remove-Item -Path $distPath -Recurse -Force
}

New-Item -ItemType Directory -Path $distPath -Force | Out-Null
Write-Host "Created dist folder" -ForegroundColor Green

# Files to copy
$filesToCopy = @('distribution.tf', 'deploy.ps1', 'destroy.ps1', 'providers.tf')

foreach ($file in $filesToCopy) {
    $sourcePath = Join-Path $PSScriptRoot $file
    $destPath = Join-Path $distPath $file
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "Copied $file" -ForegroundColor Green
    } else {
        Write-Host "WARNING: $file not found" -ForegroundColor Yellow
    }
}

# Copy environment files from deploy folder
$deployRoot = Split-Path -Parent $PSScriptRoot
$envFiles = @('.env', 'central.env')

foreach ($envFile in $envFiles) {
    $sourcePath = Join-Path $deployRoot $envFile
    $destPath = Join-Path $distPath $envFile
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "Copied $envFile" -ForegroundColor Green
    } else {
        Write-Host "WARNING: $envFile not found" -ForegroundColor Yellow
    }
}

Write-Host "Build complete. Files placed in $distPath" -ForegroundColor Cyan
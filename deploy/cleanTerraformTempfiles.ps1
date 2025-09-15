# Define base directory (one level up from current directory)
$startDir = Join-Path (Get-Location) ".."
$targetDirs = @("deploy", "module/*/func/deploy", "ui/deploy")
$skipDirs = @(".terraform", "node_modules", ".git", "dist")
$deleteFiles = @(".terraform.lock.hcl", "terraform.tfstate.backup", "planfile", "terraform.tfstate", ".env")

function Remove-Recursive($path) {
    if (Test-Path $path) {
        if ((Get-Item $path).PSIsContainer) {
            Get-ChildItem $path -Force | ForEach-Object {
                Remove-Recursive $_.FullName
            }
            Remove-Item $path -Recurse -Force
            Write-Host "Removed directory: $path"
        } else {
            Remove-Item $path -Force
            Write-Host "Removed file: $path"
        }
    }
}

function Clean-Dir($targetDir) {
    if (-Not (Test-Path $targetDir)) { return }

    Get-ChildItem $targetDir -Force | ForEach-Object {
        $fullPath = $_.FullName
        if (-Not $_.PSIsContainer -and $deleteFiles -contains $_.Name) {
            Remove-Item $fullPath -Force
            Write-Host "Removed file: $fullPath"
        } elseif ($_.PSIsContainer -and $deleteFiles -contains $_.Name) {
            Remove-Recursive $fullPath
        } elseif ($_.PSIsContainer) {
            if ($skipDirs -contains $_.Name) {
                Write-Host "Skip directory: $($_.Name)"
                return
            }
            Clean-Dir $fullPath
        }
    }
}

function Clean-TerraformTemp($baseDir) {
    foreach ($pattern in $targetDirs) {
        $resolvedPattern = Join-Path $baseDir $pattern
        $dirs = Get-ChildItem -Path $resolvedPattern -Directory -Recurse -ErrorAction SilentlyContinue
        foreach ($dir in $dirs) {
            Clean-Dir $dir.FullName
        }
    }
}

Write-Host "Starting cleaning Terraform temp files..."
Clean-TerraformTemp $startDir
Write-Host "Done!"

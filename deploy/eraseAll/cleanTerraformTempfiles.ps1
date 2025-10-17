# Define base directory (one level up from current directory)
#$targetDirs = @("deploy", "module/*/func/deploy", "ui/deploy")
#$skipDirs = @(".terraform", "node_modules", ".git", "dist")
#$deleteFiles = @(".terraform.lock.hcl", "terraform.tfstate.backup", "planfile", "terraform.tfstate", ".env")

$ErrorActionPreference = "Continue"
Write-Host "Starting cleaning Terraform temp files..."
$startDir = Resolve-Path -Path ..\.. # One level up from current directory
function Remove-FileIfExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$StartPath
        ,
        [Parameter(Mandatory = $true)]
        [string]$SubPath
    )
    $Path = Join-Path $StartPath $SubPath

    if (-not (Test-Path -LiteralPath $Path)) {
        #Write-Host "File not found, skipping: $Path"
        return
    }

    try {
        Remove-Item -LiteralPath $Path -Force -ErrorAction Stop
        Write-Host "Deleted: $Path"
    } catch {
        Write-Error "Failed to delete '$Path': $($_.Exception.Message)"
    }
}


Remove-FileIfExists -StartPath $startDir -SubPath 'deploy\.env'
Remove-FileIfExists -StartPath $startDir -SubPath 'deploy\deployEnv\.terraform.lock.hcl'
Remove-FileIfExists -StartPath $startDir -SubPath 'deploy\initEnv\.terraform.lock.hcl'
Remove-FileIfExists -StartPath $startDir -SubPath 'deploy\initEnv\terraform.tfstate.backup'
Remove-FileIfExists -StartPath $startDir -SubPath 'deploy\initEnv\terraform.tfstate'
Remove-FileIfExists -StartPath $startDir -SubPath 'ui\deploy\env\planfile'
Remove-FileIfExists -StartPath $startDir -SubPath 'module\profile\func\deploy\env\planfile'
# Remove-Item "$startDir\deploy\deployEnv\.terraform.lock.hcl"
# Remove-Item "$startDir\deploy\deployEnv\.terraform.lock.hcl"

Write-Host "Finished cleaning Terraform temp files."

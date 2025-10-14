# Define base directory (one level up from current directory)
#$targetDirs = @("deploy", "module/*/func/deploy", "ui/deploy")
#$skipDirs = @(".terraform", "node_modules", ".git", "dist")
#$deleteFiles = @(".terraform.lock.hcl", "terraform.tfstate.backup", "planfile", "terraform.tfstate", ".env")

$ErrorActionPreference = "Continue"
Write-Host "Starting cleaning Terraform temp files..."
$startDir = Resolve-Path -Path ..\.. # One level up from current directory
Remove-Item -LiteralPath (Join-Path $startDir 'deploy\.env') -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path $startDir 'deploy\deployEnv\.terraform.lock.hcl') -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path $startDir 'deploy\initEnv\.terraform.lock.hcl') -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path $startDir 'deploy\initEnv\terraform.tfstate.backup') -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path $startDir 'deploy\initEnv\terraform.tfstate') -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path $startDir 'ui\deploy\env\planfile') -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path $startDir 'module\profile\func\deploy\env\planfile') -Force -ErrorAction SilentlyContinue
# Remove-Item "$startDir\deploy\deployEnv\.terraform.lock.hcl"
# Remove-Item "$startDir\deploy\deployEnv\.terraform.lock.hcl"

Write-Host "Finished cleaning Terraform temp files."

@rem For Windows, this script enables powershell script execution and launches the powershell script.

@echo off
setlocal

echo Checking for PowerShell 7...

:: Check if pwsh.exe exists anywhere in PATH
where pwsh >nul 2>&1
if %errorlevel%==0 (
    echo PowerShell 7 is already installed.
    goto :continue
)

echo PowerShell 7 not found. Installing via winget...

:: Install PowerShell 7 silently
winget install --id Microsoft.PowerShell --source winget --silent --accept-package-agreements --accept-source-agreements

echo Re-checking installation...
where pwsh >nul 2>&1
if %errorlevel%==0 (
    echo Installation successful.
    goto :continue
)

echo Failed to install PowerShell 7. Falling back to Windows PowerShell.
powershell -Command "Set-ExecutionPolicy -Scope CurrentUser RemoteSigned;"
powershell -Command "Get-ExecutionPolicy -List"
powershell -ExecutionPolicy Bypass -Command "Set-Location -Path './deploy'; ./deploy.ps1"

:continue
echo Continuing with pwsh...
pwsh -Command "Set-ExecutionPolicy -Scope CurrentUser RemoteSigned;"
pwsh -Command "Get-ExecutionPolicy -List"
pwsh -ExecutionPolicy Bypass -Command "Set-Location -Path './deploy'; ./deploy.ps1"

pause

@rem For Windows, this script allows powershell script execution and launches the powershell script.

@rem powershell Set-ExecutionPolicy -Scope Process Bypass

powershell -ExecutionPolicy Bypass -Command "Set-Location -Path './deploy'; ./deployfullstack.ps1"

pause

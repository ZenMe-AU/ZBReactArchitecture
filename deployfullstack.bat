@rem For Windows, this script allows powershell script execution and launches the powershell script.

powershell Set-ExecutionPolicy -Scope Process Bypass

powershell -Command "Set-Location -Path './deploy'; ./deployfullstack.ps1"

pause

@rem For Windows, this script allows powershell script execution and launches the powershell script.

powershell Set-ExecutionPolicy -Scope CurrentUser RemoteSigned;
powershell Get-ExecutionPolicy -List

powershell -ExecutionPolicy Bypass -Command "Set-Location -Path './deploy'; ./deployfullstack.ps1"

pause

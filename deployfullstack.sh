#!/bin/bash
# For Linux/macOS, this script changes to the deploy directory and runs the PowerShell script.

cd ./deploy
pwsh ./deploy.ps1

read -p "Press Enter to continue..."

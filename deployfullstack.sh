#!/bin/bash
# For Linux/macOS, this script changes to the deploy directory and runs the PowerShell script.

cd ./deploy
pwsh ./deployfullstack.ps1

read -p "Press Enter to continue..."

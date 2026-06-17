#!/bin/bash

set +x
echo "Checking for PowerShell..."

# Check if pwsh exists
if which pwsh >/dev/null 2>&1; then
    echo "PowerShell is already installed."
else
    echo "PowerShell is not installed. Installing PowerShell..."
    # Install PowerShell
    sudo apt-get update 
    sudo apt-get install -y powershell
fi

echo "Rehecking PowerShell installation..."
if which pwsh >/dev/null 2>&1; then
    echo "PowerShell installed successfully."
else
    echo "Failed to install PowerShell."
    exit 1
fi

echo "Continuing with deployment of local dependencies in PowerShell..."
pwsh -NoProfile -File ./deploy/deploy.ps1

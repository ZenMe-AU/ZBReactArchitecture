$ErrorActionPreference = 'Stop'

function checkDependencies() {

    Write-Host "Running all *.test.js files using npm run test."

    $settingsPath = "../local.settings.json"

    Write-Host "Checking local.settings.json"
    if (-Not (Test-Path $settingsPath)) {
        Write-Host "Error: local.settings.json not found."
        exit 0
    }

    Write-Host "Checking url"

    $json = Get-Content $settingsPath -Raw | ConvertFrom-Json
    $questionUrl = $json.Values.BASE_URL

    if (-not $questionUrl) {
        Write-Host "Error: BASE_URL not set in local.settings.json."
        exit 1
    }

    try {
        $response = Invoke-WebRequest -Uri $questionUrl -UseBasicParsing -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "BASE_URL is healthy (HTTP 200)."
        } else {
            Write-Host "Error: BASE_URL returned HTTP $($response.StatusCode)."
            exit 2
        }
    } catch {
        Write-Host "Error: Failed to reach BASE_URL: $_"
        exit 3
    }
}

checkDependencies
npm run test testQuestion.test.js
Write-Host "All tests completed."

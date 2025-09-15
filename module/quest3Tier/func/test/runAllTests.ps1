# Run all *.test.js files in this module using npm

$ErrorActionPreference = 'Stop'

Write-Host "Running all *.test.js files using npm run test."

$settingsPath = "../local.settings.json"

Write-Host "Checking local.settings.json"
if (-Not (Test-Path $settingsPath)) {
    Write-Host "Error: local.settings.json not found."
    exit 0
}

Write-Host "Checking url"

$json = Get-Content $settingsPath -Raw | ConvertFrom-Json
$questionUrl = $json.Values.QUESTION_URL

if (-not $questionUrl) {
    Write-Host "Error: QUESTION_URL not set in local.settings.json."
    exit 1
}

try {
    $response = Invoke-WebRequest -Uri $questionUrl -UseBasicParsing -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "QUESTION_URL is healthy (HTTP 200)."
    } else {
        Write-Host "Error: QUESTION_URL returned HTTP $($response.StatusCode)."
        exit 2
    }
} catch {
    Write-Host "Error: Failed to reach QUESTION_URL: $_"
    exit 3
}

# Find all test files recursively
$testFiles = Get-ChildItem -Path . -Recurse -Filter *.test.js | ForEach-Object { $_.FullName }

if ($testFiles.Count -eq 0) {
    Write-Host "Error: No test files found."
    exit 0
}

foreach ($file in $testFiles) {
    Write-Host "=== Running test: $file ==="
    $env:TEST_FILE = $file
    npm run test
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Test failed: $file"
        exit $LASTEXITCODE
    }
}

Write-Host "All tests passed."

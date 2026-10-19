[CmdletBinding()]
param(
    [string]$ModelDir = 'D:\Models\OpenVINO\Qwen2.5-Coder-14B-Instruct-int4-ov',
    [string]$Device = 'GPU',
    [switch]$ViewerOnly
)

$ErrorActionPreference = 'Stop'
$env:OPENVINO_LOG_LEVEL="4"

Write-Host "Verifying OpenVINO model directory at $ModelDir..."
if (-not (Test-Path $ModelDir)) {
    throw "Model directory '$ModelDir' does not exist. Please check the path."
}

Push-Location (Join-Path $PSScriptRoot '../../../../..')
try {
    $savedEnvironment = @{}
    foreach ($name in @('LLM_PROVIDER', 'OPENVINO_MODEL_DIR', 'OPENVINO_DEVICE', 'AGENT_RUN')) {
        $savedEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
    }

    $env:LLM_PROVIDER = 'openvino'
    $env:OPENVINO_MODEL_DIR = $ModelDir
    $env:OPENVINO_DEVICE = $Device
    $env:AGENT_RUN = '1'

    Write-Host 'Building Q3 and the agent viewer...'
    & pnpm --dir module/quest3Tier/func run build
    if ($LASTEXITCODE -ne 0) {
        throw "Q3 build failed with exit code $LASTEXITCODE."
    }
    & pnpm exec tsc --project module/quest3Tier/func/vitest/agents/tsconfig.json
    if ($LASTEXITCODE -ne 0) {
        throw "Viewer build failed with exit code $LASTEXITCODE."
    }

    $viewerPort = if ($env:AGENT_VIEW_PORT) { [int]$env:AGENT_VIEW_PORT } else { 4178 }
    $viewerUrl = "http://127.0.0.1:$viewerPort"
    $viewerRunning = $false
    try {
        $viewerState = Invoke-RestMethod -Uri "$viewerUrl/api/run" -TimeoutSec 3
        $viewerRunning = $null -ne $viewerState.status
    }
    catch {
        $viewerRunning = $false
    }
    if ($viewerRunning) {
        throw "A viewer is already running at $viewerUrl. Close its Node window first, then rerun this script to see its output here."
    }

    Write-Host "Start the test from the viewer UI at $viewerUrl. The Q3 API must already be running."
    Write-Host 'Viewer and test output will appear here. Press Ctrl+C to stop the viewer.'
    & node module/quest3Tier/func/dist/vitest/agents/viewer/server.mjs
    if ($LASTEXITCODE -ne 0) {
        throw "Viewer exited with code $LASTEXITCODE."
    }
}
finally {
    Pop-Location
    if ($savedEnvironment) {
        foreach ($name in $savedEnvironment.Keys) {
            [Environment]::SetEnvironmentVariable($name, $savedEnvironment[$name], 'Process')
        }
    }
}

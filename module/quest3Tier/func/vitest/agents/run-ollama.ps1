[CmdletBinding()]
param(
    [string]$Model = 'llama3.2:1b',
    [string]$OllamaUrl = 'http://localhost:11434',
    [switch]$SmokeOnly
)

$ErrorActionPreference = 'Stop'
$baseUrl = $OllamaUrl.TrimEnd('/')

Write-Host "Checking Ollama at $baseUrl..."
try {
    $models = Invoke-RestMethod -Uri "$baseUrl/api/tags" -TimeoutSec 10
}
catch {
    throw "Cannot reach Ollama at $baseUrl. Start Ollama (ollama serve), then retry. $($_.Exception.Message)"
}
if ($Model -notin $models.models.name) {
    throw "Model '$Model' is not installed. Run: ollama pull $Model"
}

Write-Host "Testing $Model through the OpenAI-compatible endpoint..."
$request = @{
    model = $Model
    messages = @(
        @{ role = 'system'; content = 'Reply with only one JSON object that matches this JSON Schema, no other text: {"type":"object","properties":{"ok":{"type":"boolean"}},"required":["ok"]}' }
        @{ role = 'user'; content = 'Return {"ok":true}.' }
    )
} | ConvertTo-Json -Depth 10
$response = Invoke-RestMethod -Uri "$baseUrl/v1/chat/completions" -Method Post -ContentType 'application/json' -Body $request -TimeoutSec 180
$text = [string]$response.choices[0].message.content
$firstBrace = $text.IndexOf('{')
$lastBrace = $text.LastIndexOf('}')
if ($firstBrace -lt 0 -or $lastBrace -lt $firstBrace) {
    throw "Ollama did not return a JSON object: $text"
}
$reply = $text.Substring($firstBrace, $lastBrace - $firstBrace + 1) | ConvertFrom-Json
if ($reply.ok -ne $true) {
    throw "Ollama JSON smoke test failed: $text"
}
Write-Host 'Ollama JSON smoke test passed.'
if ($SmokeOnly) { return }

$savedEnvironment = @{}
foreach ($name in @('LLM_BASE_URL', 'LLM_API_KEY', 'AGENT_MODEL', 'JUDGE_MODEL', 'AGENT_RUN')) {
    $savedEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
}
Push-Location (Join-Path $PSScriptRoot '../../../../..')
try {
    $env:LLM_BASE_URL = "$baseUrl/v1"
    $env:AGENT_MODEL = $Model
    $env:JUDGE_MODEL = $Model
    $env:AGENT_RUN = '1'
    Remove-Item Env:LLM_API_KEY -ErrorAction SilentlyContinue
    Write-Host 'Running the Q3 agent test. Azurite and the Q3 API must already be running.'
    & pnpm exec vitest run module/quest3Tier/func/vitest/agents/agentChat.test.mts --disableConsoleIntercept
    if ($LASTEXITCODE -ne 0) {
        throw "Agent test failed with exit code $LASTEXITCODE."
    }
}
finally {
    Pop-Location
    foreach ($name in $savedEnvironment.Keys) {
        [Environment]::SetEnvironmentVariable($name, $savedEnvironment[$name], 'Process')
    }
}
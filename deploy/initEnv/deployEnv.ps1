Set-Location $PSScriptRoot
$env:TF_VAR_env_type="dev"
Copy-Item "../central.env" "central.env"
node ./initEnvironment.cjs --envDir=.
# This script runs the js files that run terraform files to deploy the environment and code.

cd initEnv
node ./initEnvironment.js

cd ../deployEnv
node ./deployEnvironment.js

cd ../../ui/deploy/env
node ./deployEnvironment.js

cd ../module/questionV3/func/deploy
./deployModule.ps1


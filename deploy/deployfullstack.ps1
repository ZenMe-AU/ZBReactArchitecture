cd initEnv
node ./initEnvironment.js
cd ../deployEnv
node ./deployEnvironment.js
cd ..
node ../ui/deploy/env/deployEnvironment.js

#node ../module/questionV3/func/deploy/env/runTerraform.js
cd ../module/questionV3/func/deploy
./deployModule.ps1


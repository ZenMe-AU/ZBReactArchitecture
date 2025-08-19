# This runs the js files that runs the terraform files that deployes this module infrastructure and code.
npm install
node .\env\deployEnvironment.js
node .\env\databaseSecurity.js
node .\updateDbSchema.js
# deploy the code
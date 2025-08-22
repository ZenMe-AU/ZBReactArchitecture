node ./env/deployEnvironment.js --auto-approve
node ./env/databaseSecurity.js
node ./schema/updateDbSchema.js
node ./code/deploy.js

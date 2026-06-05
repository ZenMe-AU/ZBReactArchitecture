#

# Steps to setup for local debugging

In your database server create a database called profile and give the vscode user "owner" permissions.

Ensure the correct settings for your database is in: deploy\db\config.cjs

In a terminal in func folder run the following:
`npx sequelize-cli db:migrate --env local`
`npx sequelize-cli db:seed:all --env local`

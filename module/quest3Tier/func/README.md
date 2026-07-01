# Function App

# Steps to setup for local debugging

In your database server create a database called **_"profile"_** and give the **_"vscode"_** user "owner" permissions.

> Create the _vscode_ user if it has not already been created.

Ensure the correct settings for your database is in: `moduleroot/deploy/db/config.cjs`

## Creating a `.env` file to store database user details safely and locally

In the terminal:

1. Ensure you are inthe `moduleroot` e.g. `reporoot/module/profile/func`
2. Run `cp .env.example .env` (this should work in Linux, Mac, and Powershell on Windows)
3. In the newly created `.env` file, use the credentials for the "vscode" postgres user to fill in the `DB_USER` and `DB_PASSWORD` variables.

## Running sequelize

> Note: May need to run `pnpm i` first if the following commands do not execute successfully.

1. `npx sequelize-cli db:migrate --env local`
2. `npx sequelize-cli db:seed:all --env local`   
3. 

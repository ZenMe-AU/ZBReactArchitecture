# Function App

# Steps to setup for local debugging

In your database server create a database called **_"profile"_** and give the **_"vscode"_** user "owner" permissions.

> On your database create the vscode user if it has not already been created.


## Deploy the Database

1. Update local.settings.json with your DB username and password. Make sure never to commit this!
2. pnpm run dbmigrate:local



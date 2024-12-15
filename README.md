# ZenMeChatPOC1

Follow these instructions to test the POC chat app on your local machine.

## Run the script to start react.js

```
npm run dev
```

with local api domain:

```
npm run dev:local-api
```

## Allow connection to Azure DB

Allow your computer to connect to the DB on Azure.
Browse to: https://portal.azure.com

Open Postgress1 > Networking > Add current client IP address.

## Run the APIs

```
npm run api
```

or

```
cd api
npm run start
```

## Open api/swagger link

Once the API has started, open the swagger link from the terminal and note the port that is being used.
http://localhost:xxxx/api/swagger

## Update UI config for localhost

Open the UI config file xxx and edit so that the UI connects to the localhost for the api.

## Run Jest tests

Open a terminal in the api folder.

```
cd api
```

and

```
npm run test:local testSearchLocationQty

npm run test:local testSearchLocationAttribute

npm run test:local testSearchProfileAttribute

```

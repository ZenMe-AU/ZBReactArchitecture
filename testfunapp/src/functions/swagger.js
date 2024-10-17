const { app } = require("@azure/functions");
const swaggerUI = require("../swagger/swaggerUI.js");
const swaggerJSON = require("../swagger/swaggerJSON.js");

app.http("docs", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: swaggerUI,
});

app.http("swaggerJson", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: swaggerJSON,
});

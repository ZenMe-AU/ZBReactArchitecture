const { app } = require("@azure/functions");
const swaggerUI = require("../swagger/swaggerUI.js");
const swaggerJSON = require("../swagger/swaggerJSON.js");
const swaggerPath = require("../swagger/swaggerPath.js");

app.http("docs", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: swaggerUI,
});

app.http("swaggerJson", {
  route: "swagger.json",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: swaggerJSON,
});

app.http("swaggerPath", {
  route: "swagger/{path}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: swaggerPath,
});

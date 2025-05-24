const { app } = require("@azure/functions");
const swaggerUI = require("./swaggerUI.js");
const swaggerJSON = require("./swaggerJSON.js");
const swaggerPath = require("./swaggerPath.js");

app.http("swagger", {
  route: "swagger",
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

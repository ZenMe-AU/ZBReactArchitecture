const { app } = require("@azure/functions");
const swaggerUI = require("../module/swagger/swaggerUI.js");
const swaggerJSON = require("../module/swagger/swaggerJSON.js");
const swaggerPath = require("../module/swagger/swaggerPath.js");

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

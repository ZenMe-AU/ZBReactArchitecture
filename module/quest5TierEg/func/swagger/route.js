/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// const { app } = require("@azure/functions");
const swaggerUI = require("./swaggerUI.js");
const swaggerJSON = require("./swaggerJSON.js");
const swaggerPath = require("./swaggerPath.js");
const funcClientFactory = require("../funcClient/factory.js");
// TODO: create the client based on environment variables
const app = funcClientFactory.getClient();

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

app.http("defaultPage", {
  route: "{ignored:maxlength(0)?}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: swaggerUI,
});

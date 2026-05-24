/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { app } from "@azure/functions";
import swaggerUI from "./swaggerUI.js";
import swaggerJSON from "./swaggerJSON.js";
import swaggerPath from "./swaggerPath.js";

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

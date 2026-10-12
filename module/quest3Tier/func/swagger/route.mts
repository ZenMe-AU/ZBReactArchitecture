/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { app } from "@azure/functions";
import swaggerUI from "./swaggerUI.mjs";
import swaggerPath from "./swaggerPath.mjs";

app.http("swagger", {
  route: "swagger",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: swaggerUI,
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

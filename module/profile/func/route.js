/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { app } from "@azure/functions";
import __req1wytxr from "./handler/handlerWrapper.js";
const { requestHandler } = __req1wytxr;
import authHandler from "./handler/authHandler.js";
import profileHandler from "./handler/handler.js";

app.http("Login", {
  route: "auth/login",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: requestHandler(authHandler.loginUser),
});

app.http("Verify", {
  route: "auth/verify",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(authHandler.verify),
});

app.http("GetAttributes", {
  route: "attributes/{userId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(profileHandler.GetAttributes),
});

app.http("PutAttributes", {
  route: "attributes/{userId}",
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: requestHandler(profileHandler.PutAttributes),
});

app.http("CreateProfile", {
  route: "profile",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: requestHandler(profileHandler.CreateProfile),
});

app.http("SearchProfile", {
  route: "profile",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(profileHandler.SearchProfile),
});

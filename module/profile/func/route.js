/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { app } from "@azure/functions";
import { requestHandler } from "./handler/handlerWrapper.js";
import { loginUser, verify } from "./handler/authHandler.js";
import { GetAttributes, PutAttributes, CreateProfile, SearchProfile } from "./handler/handler.js";

app.http("Login", {
  route: "auth/login",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: requestHandler(loginUser),
});

app.http("Verify", {
  route: "auth/verify",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(verify),
});

app.http("GetAttributes", {
  route: "attributes/{userId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(GetAttributes),
});

app.http("PutAttributes", {
  route: "attributes/{userId}",
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: requestHandler(PutAttributes),
});

app.http("CreateProfile", {
  route: "profile",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: requestHandler(CreateProfile),
});

app.http("SearchProfile", {
  route: "profile",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(SearchProfile),
});

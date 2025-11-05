/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { app } = require("@azure/functions");
const { requestHandler } = require("./handler/handlerWrapper.js");
const coordinateHandler = require("./handler/handler.js");

app.http("SearchAtLocationQty", {
  route: "SearchAtLocationQty",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(coordinateHandler.SearchAtLocationQty),
});

app.http("GetUsersDataByCoord", {
  route: "GetUsersDataByCoord",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(coordinateHandler.GetUsersDataByCoord),
});

app.http("LocationWrite", {
  route: "LocationWrite",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: requestHandler(coordinateHandler.LocationWrite),
});

app.http("SearchUsersData", {
  route: "SearchUsersData",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(coordinateHandler.SearchUsersData),
});

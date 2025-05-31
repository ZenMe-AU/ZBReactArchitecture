const { app } = require("@azure/functions");
const { requestHandler } = require("../shared/handler.js");
const coordinateHandler = require("./handler.js");

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

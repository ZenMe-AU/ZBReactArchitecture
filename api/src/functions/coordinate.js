const { app } = require("@azure/functions");
const coordinateHandler = require("../handler/coordinateHandler.js");

app.http("SearchAtLocationQty", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: coordinateHandler.SearchAtLocationQty,
});

app.http("GetUsersDataByCoord", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: coordinateHandler.GetUsersDataByCoord,
});

app.http("LocationWrite", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: coordinateHandler.LocationWrite,
});

app.http("SearchUsersData", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: coordinateHandler.SearchUsersData,
});

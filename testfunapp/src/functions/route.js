const { app } = require("@azure/functions");
const handler = require("./handler.js");

app.http("GetUsersQtyByCoord", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: handler.GetUsersQtyByCoord,
});

app.http("GetUsersDataByCoord", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: handler.GetUsersDataByCoord,
});

app.http("LocationWrite", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: handler.LocationWrite,
});

app.http("SearchUsersData", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: handler.SearchUsersData,
});

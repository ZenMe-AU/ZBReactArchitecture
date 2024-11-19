const { app } = require("@azure/functions");
const handler = require("./handler.js");

app.http("SearchAtLocationQty", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: handler.SearchAtLocationQty,
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

app.http("GetAttributes", {
  route: "attributes/{userId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: handler.GetAttributes,
});

app.http("PutAttributes", {
  route: "attributes/{userId}",
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: handler.PutAttributes,
});

app.http("CreateProfile", {
  route: "profile",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: handler.CreateProfile,
});

app.http("SearchProfile", {
  route: "profile",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: handler.SearchProfile,
});

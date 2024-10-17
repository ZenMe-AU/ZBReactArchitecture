const { app } = require("@azure/functions");
const handler = require("./handler.js");

/* @swagger
 * /api/resource:
 * get:
 * summary: Get a resource
 * description: Get a specific resource by ID.
 * parameters:
 * — in: path
 * name: id
 * required: true
 * description: ID of the resource to retrieve.
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Successful response
 */
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

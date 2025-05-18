// This file is auto-loaded by functions/routes.js
const { requestHandler } = require("../shared/handler.js");
const coordinateHandler = require("./handler.js");

module.exports = [
  {
    name: "SearchAtLocationQty",
    methods: ["GET"],
    handler: requestHandler(coordinateHandler.SearchAtLocationQty),
  },
  {
    name: "GetUsersDataByCoord",
    methods: ["GET"],
    handler: requestHandler(coordinateHandler.GetUsersDataByCoord),
  },
  {
    name: "LocationWrite",
    methods: ["POST"],
    handler: requestHandler(coordinateHandler.LocationWrite),
  },
  {
    name: "SearchUsersData",
    methods: ["GET"],
    handler: requestHandler(coordinateHandler.SearchUsersData),
  },
];

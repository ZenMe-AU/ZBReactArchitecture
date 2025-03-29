// This file is auto-loaded by functions/routes.js
const coordinateHandler = require("./handler.js");

module.exports = [
  {
    name: "SearchAtLocationQty",
    methods: ["GET"],
    handler: coordinateHandler.SearchAtLocationQty,
  },
  {
    name: "GetUsersDataByCoord",
    methods: ["GET"],
    handler: coordinateHandler.GetUsersDataByCoord,
  },
  {
    name: "LocationWrite",
    methods: ["POST"],
    handler: coordinateHandler.LocationWrite,
  },
  {
    name: "SearchUsersData",
    methods: ["GET"],
    handler: coordinateHandler.SearchUsersData,
  },
];

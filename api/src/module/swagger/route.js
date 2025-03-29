// This file is auto-loaded by functions/routes.js
const swaggerUI = require("./swaggerUI.js");
const swaggerJSON = require("./swaggerJSON.js");
const swaggerPath = require("./swaggerPath.js");

module.exports = [
  {
    name: "swagger",
    path: "swagger",
    methods: ["GET"],
    handler: swaggerUI,
  },
  {
    name: "swaggerJson",
    path: "swagger.json",
    methods: ["GET"],
    handler: swaggerJSON,
  },
  {
    name: "swaggerPath",
    path: "swagger/{path}",
    methods: ["GET"],
    handler: swaggerPath,
  },
];

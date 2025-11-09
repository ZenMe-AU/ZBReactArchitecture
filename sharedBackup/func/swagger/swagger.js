/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const swaggerJsDoc = require("swagger-jsdoc");
const path = require("path");

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Azure Function API",
      version: "1.0.0",
      description: "API documentation for Azure Functions",
    },
    // servers: [
    //   {
    //     url: "http://localhost:7071/api", // Update with your local function URL
    //   },
    // ],
  },
  apis: [path.join(process.cwd(), "./handler.js"), path.join(process.cwd(), "./handler/*.js")], // Point to your function files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = swaggerDocs;

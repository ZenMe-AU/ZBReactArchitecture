/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import swaggerJsDoc from "swagger-jsdoc";
import path from "path";

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Azure Function API",
      version: "1.0.0",
      description: "API documentation for Azure Functions",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    // servers: [
    //   {
    //     url: "http://localhost:7071/api", // Update with your local function URL
    //   },
    // ],
  },
  apis: [path.join(process.cwd(), "./handler.js"), path.join(process.cwd(), "./handler/*.js")], // Point to your function files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
export default swaggerDocs;

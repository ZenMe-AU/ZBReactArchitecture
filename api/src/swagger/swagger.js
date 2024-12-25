const swaggerJsDoc = require("swagger-jsdoc");

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
  apis: ["./src/functions/**/*.js", "./src/handler/**/*.js"], // Point to your function files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = swaggerDocs;

const fs = require("fs");
const path = require("path");

const basePath = path.join(__dirname, "../module");
const schemas = {};

fs.readdirSync(basePath).forEach((moduleName) => {
  const schemaPath = path.join(basePath, moduleName, "schema");

  if (fs.existsSync(schemaPath) && fs.statSync(schemaPath).isDirectory()) {
    fs.readdirSync(schemaPath).forEach((file) => {
      if (file.endsWith("Schema.js")) {
        const schemaName = path.basename(file, ".js");
        schemas[schemaName] = require(path.join(schemaPath, file));
      }
    });
  }
});

module.exports = schemas;

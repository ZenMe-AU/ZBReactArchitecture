const fs = require("fs");
const path = require("path");

const files = fs.readdirSync(__dirname).filter((file) => file !== "index.js" && file.endsWith(".js"));
const schemas = {};

files.forEach((file) => {
  const schemaName = path.basename(file, ".js");
  schemas[schemaName] = require(path.join(__dirname, file));
});

module.exports = schemas;

const fs = require("fs");
const path = require("path");
const swaggerUi = require("swagger-ui-dist");

module.exports = async function swaggerUI(context, req) {
  const swaggerFilePath = path.join(
    swaggerUi.getAbsoluteFSPath(),
    "index.html"
  );
  console.log(swaggerFilePath);
  let swaggerHtml = fs.readFileSync(swaggerFilePath, "utf-8");
  console.log(swaggerHtml);
  swaggerHtml = swaggerHtml.replace(
    "https://petstore.swagger.io/v2/swagger.json",
    "/api/swaggerJson"
  );

  return {
    status: 200,
    headers: { "Content-Type": "text/html" },
    body: swaggerHtml,
  };
};

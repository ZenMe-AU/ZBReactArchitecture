/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const fs = require("fs");
const path = require("path");
const swaggerUi = require("swagger-ui-dist");

module.exports = async function swaggerUI(context, req) {
  const swaggerFilePath = path.join(swaggerUi.getAbsoluteFSPath(), "index.html");

  let swaggerHtml = fs.readFileSync(swaggerFilePath, "utf-8");

  swaggerHtml = swaggerHtml.replace("https://petstore.swagger.io/v2/swagger.json", "/swagger.json");

  swaggerHtml = swaggerHtml.replace('href="./swagger-ui.css"', 'href="/swagger/swagger-ui.css"');

  swaggerHtml = swaggerHtml.replace('href="index.css"', 'href="/swagger/index.css"');

  swaggerHtml = swaggerHtml.replace('href="./favicon-32x32.png"', 'href="/swagger/favicon-32x32.png"');

  swaggerHtml = swaggerHtml.replace('href="./favicon-16x16.png"', 'href="/swagger/favicon-16x16.png"');

  swaggerHtml = swaggerHtml.replace('src="./swagger-ui-bundle.js"', 'src="/swagger/swagger-ui-bundle.js"');

  swaggerHtml = swaggerHtml.replace('src="./swagger-ui-standalone-preset.js"', 'src="/swagger/swagger-ui-standalone-preset.js"');

  swaggerHtml = swaggerHtml.replace('src="./swagger-initializer.js"', 'src="/swagger/swagger-initializer.js"');
  console.log(swaggerHtml);
  return {
    status: 200,
    headers: { "Content-Type": "text/html" },
    body: swaggerHtml,
  };
};

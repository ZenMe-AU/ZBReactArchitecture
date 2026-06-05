/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function (request, context) {
  const filePath = path.join(__dirname, "../node_modules/swagger-ui-dist", request.params.path || "index.html");
  console.log(filePath);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath);
    if (request.params.path === "swagger-initializer.js") {
      content = content.toString().replace("https://petstore.swagger.io/v2/swagger.json", "/swagger.json");
    }
    context.res = {
      status: 200,
      body: content,
      headers: {
        "Content-Type": getMimeType(filePath),
      },
    };
  } else {
    context.res = {
      status: 404,
      body: "File not found",
    };
  }

  console.log(context.res);
  return context.res;
}

function getMimeType(filePath) {
  const ext = path.extname(filePath);
  switch (ext) {
    case ".js":
      return "application/javascript";
    case ".css":
      return "text/css";
    case ".html":
      return "text/html";
    case ".json":
      return "application/json";
    case ".png":
      return "image/png";
    default:
      return "application/octet-stream";
  }
}

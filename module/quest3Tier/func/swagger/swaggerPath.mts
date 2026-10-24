/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-dist";
import { openAPIDocument, apiScope } from "./openapi.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function (request, context) {
  const filePath = path.join(swaggerUi.getAbsoluteFSPath(), path.basename(request.params.path || "index.html"));
  console.log(filePath);
  if (fs.existsSync(filePath)) {
    let content: string | Buffer = fs.readFileSync(filePath);
    if (request.params.path === "swagger-initializer.js") {
      const oauth = {
        clientId: process.env.SWAGGER_CLIENT_ID ?? process.env.CLIENT_ID,
        usePkceWithAuthorizationCodeGrant: true,
        scopes: [apiScope],
      };
      content = `window.onload = () => {
  window.ui = SwaggerUIBundle({
    url: "/${openAPIDocument.url}",
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl],
    layout: "StandaloneLayout",
    oauth2RedirectUrl: location.origin + "/swagger/oauth2-redirect.html",
  });
  window.ui.initOAuth(${JSON.stringify(oauth)});
};
`;
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

/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import "@apvee/azure-functions-openapi/register";
import { app, HttpRequest, HttpResponseInit } from "@azure/functions";

const apiScope = `api://${process.env.CLIENT_ID}/access_as_user`;

const [openAPIDocument] = app.openAPISetup({
  info: {
    title: "Azure Function API",
    version: "1.0.0",
    description: "API documentation for Azure Functions",
  },
  routePrefix: "/",
  formats: ["json"],
  swaggerUI: { enabled: false },
});

function customizeOpenAPI(document: any) {
  const tenantId = process.env.TENANT_ID;

  document.components ??= {};
  document.components.securitySchemes ??= {};

  document.components.securitySchemes.microsoftOAuth = {
    type: "oauth2",
    flows: {
      authorizationCode: {
        authorizationUrl: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
        tokenUrl: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
        scopes: {
          [apiScope]: "Access API",
        },
      },
    },
  };

  document.components.securitySchemes.bearerAuth = {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  };

  document.security = [{ microsoftOAuth: [apiScope] }, { bearerAuth: [] }];

  return document;
}

app.hook.postInvocation((context) => {
  const request = context.inputs[0] as HttpRequest;
  const result = context.result as HttpResponseInit;
  if (typeof request?.url !== "string" || typeof result?.body !== "string") return;
  if (!new URL(request.url).pathname.endsWith(`/${openAPIDocument.url}`)) return;
  context.result = { ...result, body: JSON.stringify(customizeOpenAPI(JSON.parse(result.body)), null, 2) };
});

export { openAPIDocument, apiScope };

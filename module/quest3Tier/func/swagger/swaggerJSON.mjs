/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

export default async function swaggerJSON(context, req) {
  const mod = await import("./swagger.js");
  const swaggerDocs = mod?.default ?? mod;
  return { jsonBody: swaggerDocs };
}

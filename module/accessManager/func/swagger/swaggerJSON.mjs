/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import mod from "./swagger.cjs";

export default async function swaggerJSON(context, req) {
  const swaggerDocs = mod?.default ?? mod;
  return { jsonBody: swaggerDocs };
}

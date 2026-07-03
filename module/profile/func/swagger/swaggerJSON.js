/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { swaggerDocs } from "./swagger.js";

export async function swaggerJSON(context, req) {
  //   context.res = {
  //     status: 200,
  //     body: swaggerDocs,
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   };
  return { jsonBody: swaggerDocs };
}

/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import swaggerDocs from "./swagger.js";

export default async function swaggerJSON(context, req) {
  //   context.res = {
  //     status: 200,
  //     body: swaggerDocs,
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   };
  return { jsonBody: swaggerDocs };
}

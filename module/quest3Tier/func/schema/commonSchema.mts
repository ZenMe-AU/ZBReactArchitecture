/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { z } from "zod";

const errorResponse = z.object({ success: z.literal(false), message: z.string() }).meta({ id: "ErrorResponse" });

export const apiResponses = (httpCodes: number[], returnSchema: z.ZodType) =>
  httpCodes.map((httpCode) => ({
    httpCode,
    schema: httpCode < 400 ? z.object({ success: z.literal(true), return: returnSchema }) : errorResponse,
  }));

/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { z } from "zod";

const uuidSchema = z.uuid().refine((value) => value[14] === "4" || value[14] === "5", "Invalid UUID version");

const successResponse = (returnSchema: z.ZodType) => z.object({ success: z.literal(true), return: returnSchema });

const errorResponseSchema = z.object({ success: z.literal(false), message: z.string() }).meta({ id: "ErrorResponse" });

export { uuidSchema, successResponse, errorResponseSchema };

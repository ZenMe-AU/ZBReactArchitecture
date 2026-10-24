/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { z } from "zod";
import { apiResponses } from "./commonSchema.mjs";

export const params = z.object({ id: z.uuid() });

export const body = z
  .object({
    answer: z.string().nullable().optional(),
    option: z.union([z.string(), z.array(z.string().trim().min(1).max(255)).min(1)]).nullable().optional(),
    when: z.string().nullable().optional(),
    duration: z.int(),
  })
  .meta({ id: "AnswerBody" });

export const responses = apiResponses([200, 400, 401, 403, 500], z.object({ id: z.uuid() }));

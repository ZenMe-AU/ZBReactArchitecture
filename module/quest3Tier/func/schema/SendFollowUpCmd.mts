/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { z } from "zod";
import { apiResponses } from "./commonSchema.mjs";

const uuid = z.uuid().refine((value) => value[14] === "4" || value[14] === "5", "Invalid UUID version");

export const headers = z.object({
  "X-Correlation-Id": z.string().optional().meta({ description: "Look up the command result with GET /getEventByCorrelationId" }),
});

export const body = z
  .strictObject({
    newQuestionId: uuid,
    question: z
      .array(
        z.strictObject({
          questionId: uuid,
          option: z.array(z.string().min(1)).min(1),
        })
      )
      .min(1),
    // Follow-up filters are no longer stored; isSave is accepted from older clients and ignored.
    isSave: z.boolean().optional(),
  })
  .meta({ id: "SendFollowUpCmd" });

export const responses = apiResponses([200, 400, 401, 500], z.literal(true));

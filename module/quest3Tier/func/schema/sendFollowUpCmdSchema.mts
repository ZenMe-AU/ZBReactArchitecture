/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { z } from "zod";
import { uuidSchema } from "./commonSchema.mjs";

export const sendFollowUpCmdSchema = z
  .strictObject({
    newQuestionId: uuidSchema,
    question: z
      .array(
        z.strictObject({
          questionId: uuidSchema,
          option: z.array(z.string().min(1)).min(1),
        })
      )
      .min(1),
    // Follow-up filters are no longer stored; isSave is accepted from older clients and ignored.
    isSave: z.boolean().optional(),
  })
  .meta({ id: "SendFollowUpCmd" });

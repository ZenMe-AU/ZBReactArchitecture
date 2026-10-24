/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { z } from "zod";
import { commandHeaders, commandResponses } from "./commonSchema.mjs";

const uuid = z.uuid().refine((value) => value[14] === "4" || value[14] === "5", "Invalid UUID version");

export const headers = commandHeaders;

export const body = z
  .union([
    z.strictObject({
      newQuestionId: uuid,
      question: z
        .array(
          z.strictObject({
            questionId: uuid,
            option: z.array(z.string().min(1)).min(1),
          })
        )
        .min(1),
      isSave: z.boolean().optional(),
    }),
    z.strictObject({
      questionIdList: z.array(uuid).min(1),
      question: z
        .array(
          z.strictObject({
            questionId: uuid,
            option: z.array(z.string().min(1)).min(1),
          })
        )
        .min(1),
      isSave: z.boolean().optional(),
    }),
  ])
  .meta({ id: "SendFollowUpCmd" });

export const responses = commandResponses;

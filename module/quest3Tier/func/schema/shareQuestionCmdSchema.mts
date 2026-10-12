/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { z } from "zod";
import { uuidSchema } from "./commonSchema.mjs";

export const shareQuestionCmdSchema = z
  .strictObject({
    newQuestionId: uuidSchema,
    receiverIds: z.array(uuidSchema).min(1),
  })
  .meta({ id: "ShareQuestionCmd" });

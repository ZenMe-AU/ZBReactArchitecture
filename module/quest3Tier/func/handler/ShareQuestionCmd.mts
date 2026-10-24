/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { z } from "zod";
import { commandHeaders, commandResponses } from "./commonSchema.mjs";

const uuid = z.uuid().refine((value) => value[14] === "4" || value[14] === "5", "Invalid UUID version");

export const headers = commandHeaders;

export const body = z
  .strictObject({
    newQuestionId: uuid,
    receiverIds: z.array(uuid).min(1),
  })
  .meta({ id: "ShareQuestionCmd" });

export const responses = commandResponses;

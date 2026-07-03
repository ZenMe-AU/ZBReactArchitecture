/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import Joi from "joi";
import { uuidSchema } from "./commonSchema.mjs";

export const shareQuestionCmdSchema = Joi.object({
  newQuestionId: uuidSchema.required(),
  profileId: uuidSchema.required(),
  receiverIds: Joi.array().items(uuidSchema.required()).min(1).required(),
});

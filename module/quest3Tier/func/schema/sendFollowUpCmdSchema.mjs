/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import Joi from "joi";
import { uuidSchema } from "./commonSchema.mjs";

export const sendFollowUpCmdSchema = Joi.object({
  profileId: uuidSchema.required(),
  newQuestionId: uuidSchema.required(),
  question: Joi.array()
    .items(
      Joi.object({
        questionId: uuidSchema.required(),
        option: Joi.array().items(Joi.string().required()).required(),
      })
    )
    .required(),
  isSave: Joi.boolean().required(),
});

/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const Joi = require("joi");
const { uuidSchema } = require("./commonSchema");

const sendFollowUpSchema = Joi.object({
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

module.exports = sendFollowUpSchema;

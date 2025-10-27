/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const Joi = require("joi");
const { uuidSchema } = require("./commonSchema");

const shareQuestionSchema = Joi.object({
  newQuestionId: uuidSchema.required(),
  profileId: uuidSchema.required(),
  receiverIds: Joi.array().items(uuidSchema.required()).min(1).required(),
});

module.exports = shareQuestionSchema;

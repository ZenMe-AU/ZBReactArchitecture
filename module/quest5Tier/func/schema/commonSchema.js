/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const Joi = require("joi");

const uuidSchema = Joi.string().guid({ version: ["uuidv4", "uuidv5"] });

module.exports = {
  uuidSchema,
};

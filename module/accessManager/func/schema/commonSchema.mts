/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import Joi from "joi";

const uuidSchema = Joi.string().guid({ version: ["uuidv4", "uuidv5"] });

export { uuidSchema };

/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import Joi from "joi";

export const updateMyProfileSchema = Joi.object({
  preferredName: Joi.string().trim().min(1).max(80).required(),
});

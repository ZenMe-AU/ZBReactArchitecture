/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { z } from "zod";
import { apiResponses } from "./commonSchema.mjs";

export const params = z.object({ id: z.uuid() });

export const body = z.object({ receiverIds: z.array(z.uuid()).optional() }).meta({ id: "ShareQuestionBody" });

export const responses = apiResponses([200, 400, 401, 500], z.literal(true));

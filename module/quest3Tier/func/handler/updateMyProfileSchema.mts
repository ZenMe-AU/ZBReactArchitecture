/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { z } from "zod";

export const updateMyProfileSchema = z.object({
  preferredName: z.string().trim().min(1).max(80),
});

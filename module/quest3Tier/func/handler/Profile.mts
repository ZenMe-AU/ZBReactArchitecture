/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { z } from "zod";
import { apiResponses } from "./commonSchema.mjs";

const friend = z
  .object({
    id: z.uuid(),
    name: z.string(),
    degree: z.number(),
    path: z.array(z.uuid()),
  })
  .meta({ id: "Friend" });

export const getMyProfileResponses = apiResponses([200, 401, 403, 500], z.object({ id: z.uuid() }));

export const updateMyProfileBody = z
  .object({ preferredName: z.string().trim().min(1).max(80) })
  .meta({ id: "UpdateMyProfileBody" });

export const updateMyProfileResponses = apiResponses(
  [200, 400, 401, 403, 500],
  z.object({ id: z.uuid(), preferredName: z.string() }),
);

export const addMyFriendParams = z.object({ id: z.uuid() });

export const addMyFriendResponses = apiResponses([200, 400, 401, 403, 500], friend);

export const getMyFriendsResponses = apiResponses(
  [200, 401, 403, 500],
  z.object({ list: z.array(friend) }),
);
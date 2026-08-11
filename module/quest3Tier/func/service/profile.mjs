/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import container from "../di/diContainer.mjs";
import { validate as isUuid } from "uuid";

async function ensureProfile(externalId) {
  if (!externalId || !isUuid(externalId)) {
    const error = new Error("Authenticated profile ID is required");
    error.status = 401;
    throw error;
  }

  const { Profile } = container.get("models");
  const existingProfile = await Profile.findOne({
    where: { external_id: externalId },
    order: [
      ["createdAt", "ASC"],
      ["internal_id", "ASC"],
    ],
  });

  if (existingProfile) {
    return { profile: existingProfile, created: false };
  }

  const profile = await Profile.create({ external_id: externalId });
  return { profile, created: true };
}

export { ensureProfile };

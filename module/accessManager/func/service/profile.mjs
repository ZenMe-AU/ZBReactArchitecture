/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import Model from "../repository/model/index.mjs";
import { validate as isUuid } from "uuid";

async function ensureProfile(externalId) {
  if (!externalId || !isUuid(externalId)) {
    const error = new Error("Authenticated profile ID is required");
    error.status = 401;
    throw error;
  }

  const existingProfile = await Model.Profile.findOne({
    where: { external_id: externalId },
    order: [
      ["createdAt", "ASC"],
      ["internal_id", "ASC"],
    ],
  });

  if (existingProfile) {
    return { profile: existingProfile, created: false };
  }

  const profile = await Model.Profile.create({ external_id: externalId });
  return { profile, created: true };
}

export { ensureProfile };

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

  const [profile, created] = await Model.Profile.findOrCreate({
    where: { internal_id: externalId },
    defaults: {
      internal_id: externalId,
      external_id: externalId,
    },
  });

  if (profile.external_id !== externalId) {
    const error = new Error("The authenticated profile ID conflicts with the existing profile");
    error.status = 409;
    throw error;
  }

  return { profile, created };
}

export { ensureProfile };

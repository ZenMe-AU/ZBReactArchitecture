/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import * as profileRepository from "../dist/repository/table/profileRepository.mjs";

async function ensureProfile(externalId) {
  const _externalId = String(externalId ?? "").trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(_externalId)) {
    const error = new Error("Authenticated profile ID must be a UUID");
    error.status = 401;
    throw error;
  }

  const result = await profileRepository.ensureProfile(_externalId);
  return {
    ...result,
    profile: { internal_id: result.profile.internalId, external_id: result.profile.externalId, createdAt: result.profile.createdAt },
  };
}

export { ensureProfile };

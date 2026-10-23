/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { getRepository } from "../repository/getRepository.mjs";

async function ensureProfile(externalId) {
  const repository = getRepository();
  const _externalId = externalId.toString().trim().slice(0, 1024); // Ensure the externalId is a string and trim it to a reasonable length
  if (!_externalId) {
    const error = new Error("Authenticated profile ID is required");
    error.status = 401;
    throw error;
  }

  const existingProfile = await repository.findProfileByExternalId(_externalId);

  if (existingProfile) {
    return { profile: existingProfile, created: false };
  }

  const profile = await repository.createProfile(_externalId);
  return { profile, created: true };
}

export { ensureProfile };

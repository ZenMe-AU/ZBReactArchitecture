/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { profileRepository } from "../repository/tableClient.mjs";

async function ensureProfile(externalId) {
  const _externalId = externalId.toString().trim().slice(0, 1024); // Ensure the externalId is a string and trim it to a reasonable length
  if (!_externalId) {
    const error = new Error("Authenticated profile ID is required");
    error.status = 401;
    throw error;
  }

  const existingProfile = await profileRepository.findOne({
    where: { external_id: _externalId },
    order: [
      ["createdAt", "ASC"],
      ["internal_id", "ASC"],
    ],
  });

  if (existingProfile) {
    return { profile: existingProfile, created: false };
  }

  const profile = await profileRepository.create({ external_id: _externalId });
  return { profile, created: true };
}

export { ensureProfile };

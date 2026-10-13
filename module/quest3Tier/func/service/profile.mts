/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { getRepository } from "../repository/getRepository.mjs";

async function ensureProfile(externalId, details = {}) {
  const repository = getRepository();
  const _externalId = externalId?.toString().trim().slice(0, 1024); // Ensure the externalId is a string and trim it to a reasonable length
  if (!_externalId) {
    const error = new Error("Authenticated profile ID is required");
    error.status = 401;
    throw error;
  }

  return repository.ensureProfile(_externalId, details);
}

async function updatePreferredName(externalId, preferredName) {
  const _externalId = externalId?.toString();
  if (!_externalId) {
    const err = new Error("Authenticated user id is missing");
    err.status = 401;
    throw err;
  }
  return getRepository().updatePreferredName(_externalId, preferredName);
}

export { ensureProfile, updatePreferredName };

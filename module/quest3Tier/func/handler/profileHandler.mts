/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { updatePreferredName } from "../service/profile.mjs";

async function GetMyProfile(request, context) {
  return { return: { id: request.userData.profileId } };
}

async function UpdateMyProfile(request, context) {
  const { preferredName } = request.clientParams;
  const profile = await updatePreferredName(request.userData.externalId, preferredName);
  return { return: { id: profile.id, preferredName } };
}

export default {
  GetMyProfile,
  UpdateMyProfile,
};

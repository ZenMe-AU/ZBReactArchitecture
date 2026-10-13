/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { updatePreferredName } from "../service/profile.mjs";
import { getRepository } from "../repository/getRepository.mjs";

async function GetMyProfile(request, context) {
  return { return: { id: request.userData.profileId } };
}

async function UpdateMyProfile(request, context) {
  const { preferredName } = request.clientParams;
  const profile = await updatePreferredName(request.userData.externalId, preferredName);
  return { return: { id: profile.id, preferredName } };
}

async function AddMyFriend(request, context) {
  const friend = await getRepository().addFriend(request.userData.profileId, request.params.id);
  return { return: friend };
}

export default {
  GetMyProfile,
  UpdateMyProfile,
  AddMyFriend,
};

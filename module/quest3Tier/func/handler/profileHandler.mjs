/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import * as profileRepository from "../dist/repository/table/profileRepository.mjs";


async function GetMyProfile(request, context) {
  return { return: { id: request.userData.profileId } };
}


export default {
  GetMyProfile
};

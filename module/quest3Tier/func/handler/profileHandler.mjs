/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import * as profileRepository from "../dist/repository/table/profileRepository.mjs";

/**
 * @swagger
 * /profiles:
 *   get:
 *     tags:
 *       - Profile
 *     summary: List people a question can be shared with
 *     description: Returns other Quest 3 profiles. Names stay anonymous until that person shares their name with the caller.
 *     responses:
 *       200:
 *         description: Successfully retrieved the profile list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
 *                           name:
 *                             type: string
 *                             example: "Jane Doe"
 *                           isNameShared:
 *                             type: boolean
 */
async function GetProfiles(request, context) {
  const identityBlind = process.env.IDENTITY_BLIND === "1" || request.userData.identityBlind;
  return { return: { list: await profileRepository.listProfiles(request.userData.profileId, 200, identityBlind) } };
}

async function GetMyProfile(request, context) {
  return { return: { id: request.userData.profileId } };
}

async function ShareName(request, context) {
  const receiverId = request.clientParams.receiverId;
  if (typeof receiverId !== "string" || !receiverId) {
    const error = new Error("receiverId is required");
    error.status = 400;
    throw error;
  }
  await profileRepository.shareName(request.userData.profileId, receiverId);
  return { return: true };
}

export default {
  GetProfiles,
  GetMyProfile,
  ShareName,
};

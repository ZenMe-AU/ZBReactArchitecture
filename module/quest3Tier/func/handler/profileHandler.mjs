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
 *     description: Returns Quest 3 profiles that have a display name, excluding the caller. Only people who have signed in to Quest 3 appear.
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
 *                           email:
 *                             type: string
 *                             nullable: true
 *                             example: "jane.doe@example.com"
 */
async function GetProfiles(request, context) {
  return { return: { list: await profileRepository.listProfiles(request.userData.profileId) } };
}

export default {
  GetProfiles,
};

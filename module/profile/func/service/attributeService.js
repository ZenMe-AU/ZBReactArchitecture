/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { attributeRepository } from "../repository/attributeRepository.js";

/**
 * get user's attributes
 *
 * @param {number} profileId - User's id
 * @return {array}
 */
async function getUserAttributeList(profileId) {
  try {
    return attributeRepository.getByProfileId(profileId);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

/**
 * update user's attributes
 *
 * @param {number} profileId - User's id
 * @param {array} tags - The attributes of user
 * @return {array}
 */
async function updateAttribute(profileId, tags) {
  try {
    return attributeRepository.updateAttribute(profileId, tags);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

export { getUserAttributeList, updateAttribute };

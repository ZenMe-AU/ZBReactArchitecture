/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { profileRepository } from "../repository/profileRepository.js";

function searchProfile(tags) {
  try {
    return profileRepository.getList(tags);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

function createProfile(name, tags = [], avatar = null) {
  try {
    return profileRepository.insertProfile(name, tags, avatar);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

function getProfileById(profileId) {
  try {
    return profileRepository.getProfile(profileId);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

export { searchProfile, createProfile, getProfileById };

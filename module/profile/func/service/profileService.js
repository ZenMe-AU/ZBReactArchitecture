/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const ProfileRepo = require("../repository/profileRepository");

function searchProfile(tags) {
  try {
    return ProfileRepo.getList(tags);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

function createProfile(name, tags = [], avatar = null) {
  try {
    return ProfileRepo.insertProfile(name, tags, avatar);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

function getProfileById(profileId) {
  try {
    return ProfileRepo.getProfile(profileId);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

module.exports = {
  searchProfile,
  createProfile,
  getProfileById,
};

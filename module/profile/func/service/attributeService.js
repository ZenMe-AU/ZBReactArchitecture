const AttributeRepo = require("../repository/attributeRepository");

/**
 * get user's attributes
 *
 * @param {number} profileId - User's id
 * @return {array}
 */
async function getUserAttributeList(profileId) {
  try {
    return AttributeRepo.getByProfileId(profileId);
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
    return AttributeRepo.updateAttribute(profileId, tags);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

module.exports = {
  getUserAttributeList,
  updateAttribute,
};

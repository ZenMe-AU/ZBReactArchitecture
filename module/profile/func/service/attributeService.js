const { Op, Sequelize } = require("sequelize");
const { Attributes } = require("../db/model");

/**
 * get user's attributes
 *
 * @param {number} profileId - User's id
 * @return {array}
 */
async function getByUser(profileId) {
  try {
    const attrData = await Attributes.findAll({
      where: {
        profileId: profileId,
      },
    });

    return attrData.map(({ tag }) => tag);
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
async function update(profileId, tags) {
  try {
    const attrData = await Attributes.findAll({
      where: {
        profileId: profileId,
      },
    });
    const originTags = attrData.map(({ tag }) => tag);
    const addTags = tags
      .filter((tag) => !originTags.includes(tag))
      .map(function (tag) {
        return {
          profileId: profileId,
          tag: tag,
        };
      });
    const deleteIds = attrData.filter(({ tag }) => !tags.includes(tag)).map(({ id }) => id);

    await Attributes.destroy({
      where: { id: deleteIds },
    });
    await Attributes.bulkCreate(addTags, {
      validate: true,
    });
    return tags;
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

module.exports = {
  getByUser,
  update,
};

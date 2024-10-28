const { Op, Sequelize } = require("sequelize");
const { Attributes } = require("../Repository/models.js");

/**
 * get user's attributes
 *
 * @param {number} userId - User's id
 * @return {array}
 */
async function getByUser(userId) {
  try {
    const attrData = await Attributes.findAll({
      where: {
        user_id: userId,
      },
    });

    return attrData.map(({ tag }) => tag);
  } catch (err) {
    console.log(err);
    return;
  }
}

/**
 * update user's attributes
 *
 * @param {number} userId - User's id
 * @param {array} tags - The attributes of user
 * @return {array}
 */
async function update(userId, tags) {
  try {
    const attrData = await Attributes.findAll({
      where: {
        user_id: userId,
      },
    });
    const originTags = attrData.map(({ tag }) => tag);
    const addTags = tags
      .filter((tag) => !originTags.includes(tag))
      .map(function (tag) {
        return {
          user_id: userId,
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
    return;
  }
}

module.exports = {
  getByUser,
  update,
};

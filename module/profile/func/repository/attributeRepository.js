const BaseRepository = require("./baseRepository");

class AttributeRepo extends BaseRepository {
  constructor() {
    super(["Attribute"]);
  }

  /**
   * get user's attributes
   *
   * @param {number} profileId - User's id
   * @return {array}
   */
  async getByProfileId(profileId) {
    const attrData = await this.Attribute.findAll({
      where: {
        profileId: profileId,
      },
      include: [
        {
          model: this.Attribute.sequelize.models.Profile,
          as: "Profile",
        },
      ],
    });

    return attrData.map(({ tag }) => tag);
  }

  /**
   * update user's attributes
   *
   * @param {number} profileId - User's id
   * @param {array} tags - The attributes of user
   * @return {array}
   */
  async updateAttribute(profileId, tags) {
    const attrData = await this.Attribute.findAll({
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

    await this.Attribute.destroy({
      where: { id: deleteIds },
    });
    await this.Attribute.bulkCreate(addTags, {
      validate: true,
    });
    return tags;
  }
}

module.exports = new AttributeRepo();

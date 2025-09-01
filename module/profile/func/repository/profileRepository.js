const BaseRepository = require("@zenmechat/shared/repository/baseRepository");
const { Op, Sequelize, QueryTypes, literal } = require("sequelize");

class ProfileRepo extends BaseRepository {
  constructor() {
    super(["Profiles", "Attributes"]);
  }

  async getList(tags) {
    let queryObj = {
      attributes: ["id", "name", "avatar"],
    };
    if (tags != null) {
      queryObj.include = [
        {
          model: this.Attributes,
          attributes: [],
          where: { tag: { [Op.like]: { [Op.any]: tags } } },
        },
      ];
      queryObj.group = ["profiles.id"];
      // queryObj.having = Sequelize.where(Sequelize.fn("COUNT", Sequelize.col("attributes.id")), {
      //   [Op.gte]: tags.length,
      // });
      queryObj.having = Sequelize.literal(`COUNT(attributes.id) >= ${tags.length}`);
    }
    return this.Profiles.findAll(queryObj);
  }

  async insertProfile(name, tags = [], avatar = null) {
    let profile = await this.Profiles.create(
      {
        name: name,
        avatar: avatar,
        attributes: tags.map(function (tag) {
          return { tag: tag };
        }),
      },
      {
        include: [Attributes],
      }
    );

    profile.deviceId = profile.id;
    await profile.save();
    return profile;
  }

  async getProfile(profileId) {
    return await this.Profiles.findByPk(profileId);
  }
}

module.exports = new ProfileRepo();

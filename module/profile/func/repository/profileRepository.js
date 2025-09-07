const BaseRepository = require("@zenmechat/shared/repository/baseRepository");
const { Op, Sequelize, QueryTypes, literal, fn, col } = require("sequelize");

class ProfileRepo extends BaseRepository {
  constructor() {
    super(["Profile", "Attribute"]);
  }

  async getList(tags) {
    let queryObj = {
      attributes: ["id", "name", "avatar"],
    };
    if (tags != null) {
      // queryObj.include = [
      //   {
      //     model: this.Attribute,
      //     as: "Attribute",
      //     attributes: [],
      //     where: { tag: { [Op.like]: { [Op.any]: tags } } },
      //   },
      // ];
      // queryObj.group = ["Profile.id"];
      // queryObj.having = Sequelize.literal(`COUNT(Attribute.id) >= ${tags.length}`);
      // const sequelize = this.Profile.sequelize;
      const tagCount = tags.length;
      const query = `
        SELECT p.*
        FROM profiles p
        JOIN attributes a ON a."profileId" = p.id
        WHERE a.tag LIKE ANY(ARRAY[:tags])
        GROUP BY p.id
        HAVING COUNT(a.id) >= :tagCount;
      `;
      return this.Profile.sequelize.query(query, {
        replacements: {
          tags,
          tagCount,
        },
        type: QueryTypes.SELECT,
      });
    }
    return this.Profile.findAll(queryObj);
  }

  async insertProfile(name, tags = [], avatar = null) {
    let profile = await this.Profile.create(
      {
        name: name,
        avatar: avatar,
        Attribute: tags.map(function (tag) {
          return { tag: tag };
        }),
      },
      {
        include: [{ model: this.Attribute, as: "Attribute" }],
      }
    );

    profile.deviceId = profile.id;
    await profile.save();
    return profile;
  }

  async getProfile(profileId) {
    return await this.Profile.findByPk(profileId);
  }
}

module.exports = new ProfileRepo();

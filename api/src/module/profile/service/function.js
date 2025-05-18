const { Op, Sequelize, QueryTypes } = require("sequelize");
const { Profiles, Location, Attributes } = require("../../../Repository/models.js");
const { sequelize } = require("../../../../models/index");

async function create(name, tags = [], avatar = null) {
  try {
    //TODO: For testing, wait 1s if name is user3, to be removed for production.
    if (name == "delaythisuser") {
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
    console.log({
      name: name,
      avatar: avatar,
    });
    let profile = await Profiles.create(
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
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

/**
 * get user's profile
 *
 * @param {number} profileId - profile id
 * @return {array}
 */
async function getById(profileId) {
  try {
    return await Profiles.findByPk(profileId);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

function getList(name, tags) {
  try {
    let queryObj = {
      attributes: ["id", "name", "avatar"],
    };
    if (tags != null) {
      queryObj.include = [
        {
          model: Attributes,
          attributes: [],
          where: { tag: { [Op.like]: { [Op.any]: tags } } },
        },
      ];
      queryObj.group = ["profiles.id"];
      queryObj.having = Sequelize.where(Sequelize.fn("COUNT", Sequelize.col("attributes.id")), {
        [Op.gte]: tags.length,
      });
    }
    return Profiles.findAll(queryObj);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

/**
 * A coordinate array
 * @typedef {Array} Coord
 * @property {number} 0 - Longitude
 * @property {number} 1 - Latitude
 */
/**
 * Get users from the database
 * @param {Coord} coord The coordinate of the user
 * @param {string} tFrom The start time
 * @param {string} tTo The end time
 * @param {number} distance The distance from the coordinate
 * @param {boolean} CountOnly If true, return the count only
 * @param {array|null} tags The attributes of users
 * @returns {Promise<Profiles>|number}
 */
function getUsersProfile(coord, tFrom, tTo, distance, CountOnly, tags = null) {
  try {
    var include = [
      {
        model: Location,
        attributes: [],
        where: [
          { createdAt: { [Op.between]: [tFrom + "Z", tTo + "Z"] } },
          Sequelize.where(
            Sequelize.fn("ST_DWithin", Sequelize.col("geom"), "SRID=4326;POINT(" + coord[0] + " " + coord[1] + ")", distance, true),
            true
          ),
        ],
        group: ["tid"],
      },
    ];
    if (tags !== null) {
      include.push({
        model: Attributes,
        attributes: [],
        where: { tag: { [Op.like]: { [Op.any]: tags } } },
        group: ["profileId"],
      });
    }
    if (CountOnly) {
      return Profiles.count({ distinct: true, col: "id", include: include });
    } else {
      return Profiles.findAll({
        attributes: ["id", ["id", "tid"], "name", "avatar"],
        include: include,
      });
    }
  } catch (err) {
    console.log(err);
    return [];
  }
}

/**
 * Get the data of users who are near a certain user within a specific time period.
 *
 * @param {string|number} deviceId - The user's device id
 * @param {string} startTime - The start time
 * @param {string} endTime - The end time
 * @param {number} distance - The distance from the user's coordinate
 * @param {number} limited - The number of return amount
 * @return {Promise<Profiles>}
 *
 */
async function getUsersProfileNearby(deviceId, startTime, endTime, distance, limited) {
  let select_query = `
        SELECT   "location"."tid"
        FROM
            (SELECT "id", "tid", "geom", "createdAt" FROM "location" AS "location"
                WHERE ("tid" = $deviceId) AND ("createdAt" BETWEEN $from AND $to)) AS "A",
            location
        WHERE
            ("location"."tid" != "A"."tid" and ST_DWithin("location"."geom", "A"."geom", $distance, true))
            and ("location"."createdAt" BETWEEN ("A"."createdAt" - INTERVAL '1 MINUTE') and ("A"."createdAt" + INTERVAL '1 MINUTE'))

        GROUP BY "location"."tid";
    `;
  try {
    var locationData = await sequelize.query(select_query, {
      bind: {
        deviceId: deviceId,
        from: startTime,
        to: endTime,
        distance: distance,
      },
      type: QueryTypes.SELECT,
    });
    var deviceIds = [];
    locationData.forEach((location) => {
      deviceIds.push(location["tid"]);
    });

    return await Profiles.findAll({
      attributes: ["id", ["id", "tid"], "name", "avatar"],
      where: {
        deviceId: deviceIds,
      },
    });
  } catch (err) {
    console.log(err);
    return [];
  }
}

module.exports = {
  getUsersProfile,
  getUsersProfileNearby,
  create,
  getById,
  getList,
};

const { Op, Sequelize, QueryTypes } = require("sequelize");
// const { Profiles, Attributes } = require("../db/model");
const { Location } = require("@zenmechat/shared/db/model");
// const { sequelize } = require("../db");

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
 * @returns {Promise<Users>|number}
 */
function getUsers(coord, tFrom, tTo, distance, CountOnly, tags = null) {
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
        group: ["userId"],
      });
    }
    if (CountOnly) {
      return Users.count({ distinct: true, col: "id", include: include });
    } else {
      return Users.findAll({
        attributes: ["id", ["deviceId", "tid"], "name", "avatar"],
        include: include,
      });
    }

    // var locationData =  await Location.findAll({
    //   attributes: ['tid'],
    //   where:[
    //     {createdAt: {[Op.between]: [from+'Z', to+'Z']}},
    //     Sequelize.where(Sequelize.fn('ST_DWithin', Sequelize.col('geom'), 'SRID=4326;POINT('+ coord[0] +' '+ coord[1] +')', distance, true), true)
    //   ]
    // });

    // var deviceIds = [];
    // locationData.forEach((location) => {
    //   deviceIds.push(location['tid']);
    // });

    // if (deviceIds.length === 0) { console.log("User is empty!"); return [];}

    // return await Users.findAll({
    //   attributes: ['id', ['deviceId', 'tid'], 'name', 'avatar'],
    //   where: {
    //       deviceId: deviceIds,
    //   },
    // });
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
 * @return {Promise<Users>}
 *
 */
async function getUsersNearby(deviceId, startTime, endTime, distance, limited) {
  let select_query = `
        SELECT   "location2"."tid"
        FROM
            (SELECT "id", "tid", "geom", "createdAt" FROM "location2" AS "location2"
                WHERE ("tid" = $deviceId) AND ("createdAt" BETWEEN $from AND $to)) AS "A",
            location2
        WHERE
            ("location2"."tid" != "A"."tid" and ST_DWithin("location2"."geom", "A"."geom", $distance, true))
            and ("location2"."createdAt" BETWEEN ("A"."createdAt" - INTERVAL '1 MINUTE') and ("A"."createdAt" + INTERVAL '1 MINUTE'))

        GROUP BY "location2"."tid";
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

    return await Users.findAll({
      attributes: ["id", ["deviceId", "tid"], "name", "avatar"],
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
  getUsers,
  getUsersNearby,
};

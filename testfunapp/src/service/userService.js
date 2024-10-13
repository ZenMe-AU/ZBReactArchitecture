const { Op, Sequelize } = require("sequelize");
const { Users, Location } = require("../Repository/models.js");

/**
 * Get users from the database
 * @param {*} coord The coordinate of the user
 * @param {*} tFrom The start time
 * @param {*} tTo The end time
 * @param {*} distance The distance from the coordinate
 * @param {*} CountOnly If true, return the count only
 * @returns
 */
function getUsers(coord, tFrom, tTo, distance, CountOnly) {
  try {
    const include = [
      {
        model: Location,
        attributes: [],
        where: [
          { createdAt: { [Op.between]: [tFrom + "Z", tTo + "Z"] } },
          Sequelize.where(
            Sequelize.fn(
              "ST_DWithin",
              Sequelize.col("geom"),
              "SRID=4326;POINT(" + coord[0] + " " + coord[1] + ")",
              distance,
              true
            ),
            true
          ),
        ],
        group: ["tid"],
      },
    ];

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

module.exports = {
  getUsers,
};

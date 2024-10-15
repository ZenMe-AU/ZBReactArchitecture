const { app } = require("@azure/functions");
const { Op, Sequelize } = require("sequelize");
const { Users, Location } = require("../../src/Repository/models.js");

app.http("SearchNearMe2", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    let device_id = request.query.get("device") || "l1";
    let request_time = new Date().toISOString().slice(0, 16);
    if (request.query.get("datetime")) {
      request_time = new Date(request.query.get("datetime"))
        .toISOString()
        .slice(0, 16);
    }
    request_time += ":59";
    let interval = request.query.get("interval") || 60;
    let distance = request.query.get("distance") || 10;
    let limited = request.query.get("limited") || 100;
    let start_time = new Date(
      new Date(request_time + "Z").getTime() - interval * 60 * 1000
    )
      .toISOString()
      .slice(0, 16);

    context.log("device_id" + device_id);
    context.log("interval" + interval);
    context.log("distance" + distance);
    context.log("limited" + limited);
    context.log("start_time" + start_time);
    context.log("request_time" + request_time);
    let users = await getUsers(
      device_id,
      start_time,
      request_time,
      distance,
      limited
    );

    return {
      body: JSON.stringify({ return: { users: users } }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  },
});

const getUsers = async (deviceId, from, to, distance, limited) => {
  try {
    var location = await Location.findAll({
      attributes: ["id", "tid", "geom", "createdAt"],
      where: {
        tid: deviceId,
        createdAt: { [Op.between]: [from + "Z", to + "Z"] },
      },
    });

    var locationWhere = [];
    location.forEach((l) => {
      var timeFrom = new Date(
        new Date(l["createdAt"]).getTime() - 60000
      ).toISOString();
      var timeTo = new Date(
        new Date(l["createdAt"]).getTime() + 60000
      ).toISOString();
      locationWhere.push({
        [Op.and]: [
          { createdAt: { [Op.between]: [timeFrom, timeTo] } },
          Sequelize.where(
            Sequelize.fn(
              "ST_DWithin",
              Sequelize.col("geom"),
              "SRID=4326;POINT(" +
                l["geom"]["coordinates"][0] +
                " " +
                l["geom"]["coordinates"][1] +
                ")",
              distance,
              true
            ),
            true
          ),
        ],
      });
    });

    if (locationWhere.length === 0) {
      console.log("Location is empty!");
      return [];
    }

    var where = {
      [Op.and]: [{ tid: { [Op.ne]: deviceId } }, { [Op.or]: locationWhere }],
    };

    var locationData = await Location.findAll({
      attributes: ["tid"],
      where: where,
      group: ["tid"],
    });

    var deviceIds = [];
    locationData.forEach((location) => {
      deviceIds.push(location["tid"]);
    });

    if (deviceIds.length === 0) {
      console.log("User is empty!");
      return [];
    }

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
};

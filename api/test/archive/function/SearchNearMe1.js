const { app } = require("@azure/functions");
const { sequelize } = require("../../../src/module/shared/db/index.js");
const { QueryTypes } = require("sequelize");
const { Users } = require("../../../src/module/shared/db/model/index.js");

//Search the database for users who were near the device at the given time.
//parameters: device, datetime, interval, distance, limited
app.http("SearchNearMe", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    let device_id = request.query.get("device") || "l1";
    let request_time = new Date().toISOString().slice(0, 16);
    if (request.query.get("datetime")) {
      request_time = new Date(request.query.get("datetime")).toISOString().slice(0, 16);
    }
    request_time += ":59";
    let interval = request.query.get("interval") || 60;
    let distance = request.query.get("distance") || 10;
    let limited = request.query.get("limited") || 100;
    let start_time = new Date(new Date(request_time + "Z").getTime() - interval * 60 * 1000).toISOString().slice(0, 16);

    context.log("device_id" + device_id);
    context.log("interval" + interval);
    context.log("distance" + distance);
    context.log("limited" + limited);
    context.log("start_time" + start_time);
    context.log("request_time" + request_time);
    let users = await getUsers(device_id, start_time, request_time, distance, limited);

    return {
      body: JSON.stringify({ return: { users: users } }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  },
});

const getUsers = async (deviceId, from, to, distance, limited) => {
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
      bind: { deviceId: deviceId, from: from, to: to, distance: distance },
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
};

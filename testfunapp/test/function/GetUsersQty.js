const { app } = require("@azure/functions");
const { getUsers } = require("../../src/service/userService.js");

app.http("GetUsersQty", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    let lon = request.query.get("lon");
    let lat = request.query.get("lat");
    let request_time = new Date().toISOString().slice(0, 16);
    if (request.query.get("datetime")) {
      request_time = new Date(request.query.get("datetime"))
        .toISOString()
        .slice(0, 16);
    }
    request_time += ":59";
    let interval = request.query.get("interval") || 60;
    let distance = request.query.get("distance") || 10;
    let countOnly = true;
    let start_time = new Date(
      new Date(request_time + "Z").getTime() - interval * 60 * 1000
    )
      .toISOString()
      .slice(0, 16);

    context.log("interval" + interval);
    context.log("distance" + distance);
    context.log("start_time" + start_time);
    context.log("request_time" + request_time);
    let qty = await getUsers(
      [lon, lat],
      start_time,
      request_time,
      distance,
      countOnly
    );

    return {
      body: JSON.stringify({
        return: {
          qty: qty,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  },
});

/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { app } = require("@azure/functions");
const { getUsers } = require("../../../src/module/profile/service/userService.js");

/**
 * @swagger
 */
app.http("SearchNearCoord", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    let lon = request.query.get("lon");
    let lat = request.query.get("lat");
    let request_time = new Date().toISOString().slice(0, 16);
    if (request.query.get("datetime")) {
      request_time = new Date(request.query.get("datetime")).toISOString().slice(0, 16);
    }
    request_time += ":59";
    let interval = request.query.get("interval") || 60;
    let distance = request.query.get("distance") || 10;
    let start_time = new Date(new Date(request_time + "Z").getTime() - interval * 60 * 1000).toISOString().slice(0, 16);

    context.log("interval" + interval);
    context.log("distance" + distance);
    context.log("start_time" + start_time);
    context.log("request_time" + request_time);
    let users = await getUsers([lon, lat], start_time, request_time, distance, false);

    return {
      body: JSON.stringify({
        return: {
          users: users,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  },
});

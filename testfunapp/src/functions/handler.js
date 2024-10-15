const Users = require("../service/userService.js");
const Location = require("../service/locationService.js");

async function GetUsersQtyByCoord(request, context) {
  let lon = request.query.get("lon");
  let lat = request.query.get("lat");
  let interval = request.query.get("interval") || 60;
  let distance = request.query.get("distance") || 10;

  let request_time = new Date().toISOString().slice(0, 16);
  if (request.query.get("datetime")) {
    request_time = new Date(request.query.get("datetime"))
      .toISOString()
      .slice(0, 16);
  }
  request_time += ":59";
  let start_time = new Date(
    new Date(request_time + "Z").getTime() - interval * 60 * 1000
  )
    .toISOString()
    .slice(0, 16);

  context.log("interval" + interval);
  context.log("distance" + distance);
  context.log("start_time" + start_time);
  context.log("request_time" + request_time);
  let qty = await Users.getUsers(
    [lon, lat],
    start_time,
    request_time,
    distance,
    true
  );
  return { jsonBody: { return: { qty: qty } } };
}

async function GetUsersDataByCoord(request, context) {
  let lon = request.query.get("lon");
  let lat = request.query.get("lat");
  let interval = request.query.get("interval") || 60;
  let distance = request.query.get("distance") || 10;

  let request_time = new Date().toISOString().slice(0, 16);
  if (request.query.get("datetime")) {
    request_time = new Date(request.query.get("datetime"))
      .toISOString()
      .slice(0, 16);
  }
  request_time += ":59";
  let start_time = new Date(
    new Date(request_time + "Z").getTime() - interval * 60 * 1000
  )
    .toISOString()
    .slice(0, 16);

  context.log("interval" + interval);
  context.log("distance" + distance);
  context.log("start_time" + start_time);
  context.log("request_time" + request_time);
  let users = await Users.getUsers(
    [lon, lat],
    start_time,
    request_time,
    distance,
    false
  );
  return { jsonBody: { return: { users: users } } };
}

async function LocationWrite(request, context) {
  context.log(`Http function processed request for url "${request.url}"`);
  const bodyText = await request.text();
  const bodyJson = JSON.parse(bodyText);
  context.log("BODY text:", bodyText);
  context.log("BODY json:", bodyJson);
  context.log(request.params);
  let topic = bodyJson["topic"].split("/").pop();
  let tid = bodyJson["tid"];
  let lat = bodyJson["lat"];
  let lon = bodyJson["lon"];
  let location = await Location.create(lon, lat, tid, topic, bodyText);

  return { jsonBody: { return: { id: location.id } } };
}

async function SearchUsersData(request, context) {
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
  let users = await Users.getUsersNearby(
    device_id,
    start_time,
    request_time,
    distance,
    limited
  );

  return { jsonBody: { return: { users: users } } };
}

module.exports = {
  GetUsersQtyByCoord,
  GetUsersDataByCoord,
  LocationWrite,
  SearchUsersData,
};

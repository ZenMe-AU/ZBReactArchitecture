const Location = require("./service/locationService.js");
const Profiles = require("../profile/service/profileService.js");

/**
 * @swagger
 * /api/SearchAtLocationQty:
 *   get:
 *     tags:
 *       - Coordinate
 *     summary: Count users quantity
 *     description: Get the number of users within a certain distance from a given coordinate in a specific time period
 *     parameters:
 *       - name: lon
 *         in: query
 *         description: The longitude of the coordinate
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           example: 151.21417
 *       - name: lat
 *         in: query
 *         description: The latitude of the coordinate
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           example: -33.85861
 *       - name: distance
 *         in: query
 *         description: The radius (in meters) from the given coordinate
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: searchTime
 *         in: query
 *         description: The end time of a specific time period
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2000-10-25T00:30
 *       - name: interval
 *         in: query
 *         description: The number of minutes before the end time (If searchTime is 2000-10-25T01:30 and interval is 30, the time period is between 2000-10-25T01:00 and 2000-10-25T01:30)
 *         required: false
 *         schema:
 *           type: integer
 *           example: 30
 *       - name: attributes
 *         in: query
 *         description: The attributes of users to filter by, such as "blond,tall,male,blue eyes". Separate multiple attributes with commas.
 *         required: false
 *         schema:
 *           type: string
 *           example: blond,tall,male,blue eyes
 *       - name: fuzzySearch
 *         in: query
 *         description: Enable fuzzy search for matching attributes.
 *         required: false
 *         schema:
 *           type: boolean
 *           example: true
 *     responses:
 *       200:
 *         description: The number of users within the given conditions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     qty:
 *                       type: integer
 *                       description: The number of users found
 *                       example: 1
 */
async function SearchAtLocationQty(request, context) {
  let lon = request.query.get("lon");
  let lat = request.query.get("lat");
  let interval = request.query.get("interval") || 60;
  let distance = request.query.get("distance") || 10;

  let request_time = new Date().toISOString().slice(0, 16);
  if (request.query.get("searchTime")) {
    request_time = new Date(request.query.get("searchTime")).toISOString().slice(0, 16);
  }
  request_time += ":59";
  let start_time = new Date(new Date(request_time + "Z").getTime() - interval * 60 * 1000).toISOString().slice(0, 16);

  let attributes = null;
  if (request.query.get("attributes")) {
    attributes = request.query.get("attributes").split(",").filter(Boolean);
    if (request.query.get("fuzzySearch") === true || request.query.get("fuzzySearch")?.toLowerCase?.() === "true") {
      attributes = attributes.map((tag) => "%" + tag + "%");
    }
  }

  context.log("fuzzySearch" + request.query.get("fuzzySearch"));
  context.log("attributes" + attributes);
  context.log("interval" + interval);
  context.log("distance" + distance);
  context.log("start_time" + start_time);
  context.log("request_time" + request_time);
  let qty = await Profiles.getUsersProfile([lon, lat], start_time, request_time, distance, true, attributes);
  return { jsonBody: { return: { qty: qty } } };
}

/**
 * @swagger
 * /api/GetUsersDataByCoord:
 *   get:
 *     tags:
 *       - Coordinate
 *     summary: Get users data
 *     description: Get a list of users within a certain distance from a given coordinate in a specific time period
 *     parameters:
 *       - name: lon
 *         in: query
 *         description: The longitude of the coordinate
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           example: 151.21417
 *       - name: lat
 *         in: query
 *         description: The latitude of the coordinate
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           example: -33.85861
 *       - name: distance
 *         in: query
 *         description: The radius (in meters) from the given coordinate
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: searchTime
 *         in: query
 *         description: The end time of a specific time period
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2000-10-25T00:30
 *       - name: interval
 *         in: query
 *         description: The number of minutes before the end time (If searchTime is 2000-10-25T01:30 and interval is 30, the time period is between 2000-10-25T01:00 and 2000-10-25T01:30)
 *         required: false
 *         schema:
 *           type: integer
 *           example: 30
 *       - name: attributes
 *         in: query
 *         description: The attributes of users to filter by, such as "blond,tall,male,blue eyes". Separate multiple attributes with commas.
 *         required: false
 *         schema:
 *           type: string
 *           example: blond,tall,male,blue eyes
 *       - name: fuzzySearch
 *         in: query
 *         description: Enable fuzzy search for matching attributes.
 *         required: false
 *         schema:
 *           type: boolean
 *           example: true
 *     responses:
 *       200:
 *         description: A list of users matching the given conditions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: The unique identifier of the user
 *                             example: 1
 *                           tid:
 *                             type: string
 *                             description: The device ID of the user
 *                             example: "l1"
 *                           name:
 *                             type: string
 *                             description: The name of the user
 *                             example: "A"
 *                           avatar:
 *                             type: string
 *                             description: The URL of the user's avatar image
 *                             example: "pic/avatar_1.jpg"
 */
async function GetUsersDataByCoord(request, context) {
  let lon = request.query.get("lon");
  let lat = request.query.get("lat");
  let interval = request.query.get("interval") || 60;
  let distance = request.query.get("distance") || 10;

  let request_time = new Date().toISOString().slice(0, 16);
  if (request.query.get("searchTime")) {
    request_time = new Date(request.query.get("searchTime")).toISOString().slice(0, 16);
  }
  request_time += ":59";
  let start_time = new Date(new Date(request_time + "Z").getTime() - interval * 60 * 1000).toISOString().slice(0, 16);

  let attributes = null;
  if (request.query.get("attributes")) {
    attributes = request.query.get("attributes").split(",").filter(Boolean);
    if (request.query.get("fuzzySearch") === true || request.query.get("fuzzySearch")?.toLowerCase?.() === "true") {
      attributes = attributes.map((tag) => "%" + tag + "%");
    }
  }
  context.log("interval" + interval);
  context.log("distance" + distance);
  context.log("start_time" + start_time);
  context.log("request_time" + request_time);
  let users = await Profiles.getUsersProfile([lon, lat], start_time, request_time, distance, false, attributes);
  return { jsonBody: { return: { users: users } } };
}

/**
 * @swagger
 * /api/LocationWrite:
 *   post:
 *     tags:
 *       - Coordinate
 *     summary: Write user location into database
 *     description: This endpoint allows writing the user's current location to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tid:
 *                 type: string
 *                 description: The device ID of the user
 *                 example: "3"
 *               topic:
 *                 type: string
 *                 description: The topic related to the user's device
 *                 example: "owntracks/owntracks/genbtn"
 *               lon:
 *                 type: number
 *                 format: float
 *                 description: The longitude of the user's location
 *                 example: 151.21417
 *               lat:
 *                 type: number
 *                 format: float
 *                 description: The latitude of the user's location
 *                 example: -33.85861
 *     responses:
 *       200:
 *         description: Successfully written user location
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the location in the database
 *                       example: 2197
 */
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
/**
 * @swagger
 * /api/SearchUsersData:
 *   get:
 *     tags:
 *       - Coordinate
 *     summary: Search nearby users within a specific time period
 *     description: Searching the users nearby a specified user within a specific time period.
 *     parameters:
 *       - name: device
 *         in: query
 *         description: The device ID of the specified user
 *         required: true
 *         schema:
 *           type: string
 *           example: "l1"
 *       - name: distance
 *         in: query
 *         description: The radius (in meters) from the specified user's location
 *         required: false
 *         schema:
 *           type: integer
 *           example: 5
 *       - name: searchTime
 *         in: query
 *         description: The specific end time of the time period (e.g., 2024-09-01T00:32)
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2024-09-01T00:32
 *       - name: interval
 *         in: query
 *         description: The number of minutes before the end time
 *         required: false
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Successfully retrieved nearby users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: The unique identifier of the user
 *                             example: 3
 *                           tid:
 *                             type: string
 *                             description: The device ID of the user
 *                             example: "3"
 *                           name:
 *                             type: string
 *                             description: The name of the user
 *                             example: "3"
 *                           avatar:
 *                             type: string
 *                             description: The URL of the user's avatar image
 *                             example: "pic/avatar_3.jpg"
 */
async function SearchUsersData(request, context) {
  let device_id = request.query.get("device") || "l1";
  let request_time = new Date().toISOString().slice(0, 16);
  if (request.query.get("searchTime")) {
    request_time = new Date(request.query.get("searchTime")).toISOString().slice(0, 16);
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
  let users = await Profiles.getUsersProfileNearby(device_id, start_time, request_time, distance, limited);

  return { jsonBody: { return: { users: users } } };
}

module.exports = {
  SearchAtLocationQty,
  GetUsersDataByCoord,
  LocationWrite,
  SearchUsersData,
};

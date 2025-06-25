const { Op, Sequelize } = require("sequelize");
const { Location } = require("@zenmechat/shared/db/model/index.js");

/**
 * write location into database
 *
 * @param {number} lon - The longitude of coordinate
 * @param {number} lat - The latitude of coordinate
 * @param {string|number} deviceId - The user's device id
 * @param {string} topic - The topic of device
 * @param {string} data - The body text sent from the device
 * @return {Promise<Location>}
 */
function create(lon, lat, deviceId, topic, data) {
  try {
    let dataDict = {
      topicId: topic,
      tid: deviceId,
      lat: lat,
      lon: lon,
      geom: { type: "Point", coordinates: [lon, lat] },
      response: data,
    };
    console.log(dataDict);
    return Location.create(dataDict);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

module.exports = {
  create,
};

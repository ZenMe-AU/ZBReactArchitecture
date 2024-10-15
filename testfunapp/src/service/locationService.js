const { Op, Sequelize } = require("sequelize");
const { Location } = require("../Repository/models.js");

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
    return;
  }
}

module.exports = {
  create,
};

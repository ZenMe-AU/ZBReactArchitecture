const { app } = require("@azure/functions");
const { Location } = require("../../../src/module/shared/db/model/index.js");

//This function writes the data as provided to the database.
app.http("LocationWrite", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    context.log(`Http function processed request for url "${request.url}"`);
    context.log(request.headers);
    const bodyText = await request.text();
    context.log("BODY text:", bodyText);
    var bodyJson;
    var dataDict = {};
    try {
      bodyJson = JSON.parse(bodyText);
    } catch (error) {
      context.log(error);
    }
    context.log("BODY json:", bodyJson);
    context.log(request.params);
    try {
      let payload = bodyJson;
      if (payload["_type"] == "location") {
        let topic = payload["topic"].split("/").pop();
        let tid = payload["tid"];
        let lat = payload["lat"];
        let lon = payload["lon"];
        context.log(`topic "${topic}"`);
        context.log(`tid "${tid}"`);
        context.log(`lat "${lat}"`);
        context.log(`lon "${lon}"`);
        let point = { type: "Point", coordinates: [lon, lat] };
        dataDict = {
          topicId: topic,
          tid: tid,
          lat: lat,
          lon: lon,
          geom: point,
          response: bodyText,
        };
        //  write actual data in database
        Location.create(dataDict);
      }
    } catch (error) {
      context.log(error);
    }
    return {
      body: JSON.stringify(dataDict),
      headers: {
        "Content-Type": "application/json",
      },
    };
  },
});

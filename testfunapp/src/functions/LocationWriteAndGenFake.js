const { app } = require('@azure/functions');
const { Location } = require('../models.js');

//This function writes the data as provided to the database.
// {
//     "lon": 151.21417,
//     "lat": -33.85861,
//     "topic": "owntracks/owntracks/genbtn",
//     "_type": "location",
//     "tid": "l1",
//     "fakeData": {
//         "minDistance":1,
//         "maxDistance":3,
//         "amount":40
//     }
// }
app.http('LocationWriteAndGenFake', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        context.log(request.headers);
        const bodyText = await request.text();
        context.log("BODY text:", (bodyText));
        var bodyJson;
        var dataDict = {};
        try {
            bodyJson = JSON.parse(bodyText);
        } catch (error) {
            context.log(error)
        }
        context.log("BODY json:", bodyJson);
        context.log(request.params);
        try {
            let payload = bodyJson;
            if (payload['_type'] == 'location') {
                let topic = payload['topic'].split('/').pop();
                let tid = payload['tid'];
                let lat = payload['lat'];
                let lon = payload['lon'];
                context.log(`topic "${topic}"`);
                context.log(`tid "${tid}"`);
                context.log(`lat "${lat}"`);
                context.log(`lon "${lon}"`);
                let point = { type: 'Point', coordinates: [lon, lat] };
                dataDict = {
                    topicId: topic,
                    tid: tid,
                    lon: lon,
                    lat: lat,
                    geom: point,
                    response: bodyText
                };
                //  write actual data in database
                Location.create(dataDict);

                // ---fake data process--- //
                let fakeDataParam = ('fakeData' in bodyJson) ? bodyJson.fakeData : {};
                let fakeInputData = [];
                let fakeDeviceAry = ('id' in fakeDataParam) ? Array.isArray(fakeDataParam.id) ? new Set(fakeDataParam.id) : new Set([fakeDataParam.id]) : new Set();
                let fakeDeviceLimit = 100;
                let maxDistance = ('maxDistance' in fakeDataParam) ? fakeDataParam.maxDistance : 10;
                let minDistance = ('minDistance' in fakeDataParam) ? fakeDataParam.minDistance : 0;
                let amount = ('id' in fakeDataParam) ? fakeDeviceAry.size : ('amount' in fakeDataParam) ? fakeDataParam.amount : Math.floor(Math.random() * fakeDeviceLimit);
                if (amount >= fakeDeviceLimit) {amount = fakeDeviceLimit-1;}
                while (fakeDeviceAry.size < amount) {
                    let n = Math.floor(Math.random() * (fakeDeviceLimit)) + 1;
                    if (n == 1) {n = 'l1';}
                    if (n === tid) {continue;}
                    fakeDeviceAry.add(n);
                }

                fakeDeviceAry.forEach((n) => {
                    let nCoord = generateLocation(lon, lat, maxDistance, minDistance);
                    let input = {
                        topicId: 'genFake'.concat('', n),
                        tid: n,
                        lon: nCoord[0],
                        lat: nCoord[1],
                        geom: {type: 'Point', coordinates: nCoord},
                        response: JSON.stringify({
                            _type: 'location',
                            topic: 'owntracks/genFake'.concat('/', n),
                            tid: n,
                            lon: nCoord[0],
                            lat: nCoord[1],
                        }),
                    }
                    fakeInputData.push(input)
                });
                Location.bulkCreate(fakeInputData, {
                    validate: true,
                });
                dataDict.fakeData = {
                    qty: fakeInputData.length,
                    data: fakeInputData
                }
                // ---fake data process--- //
            }
        } catch (error) { context.log(error) }
        return {
            body: JSON.stringify(dataDict),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
});

function generateLocation(longitude, latitude, max, min = 0) {
    // earth radius in meters
    const EARTH_RADIUS = 6371 * 1000;
    // 1° latitude length in meters
    const DEGREE = EARTH_RADIUS * 2 * Math.PI / 360;
    const r = ((max - min) * Math.random() ** 0.5) + min;

    // random angle
    const theta = Math.random() * 2 * Math.PI;

    const dy = r * Math.sin(theta);
    const dx = r * Math.cos(theta);

    let newLatitude = latitude + dy / DEGREE;
    let newLongitude = longitude + dx / (DEGREE * Math.cos(latitude * (Math.PI/180)));

    return [newLongitude, newLatitude];
}
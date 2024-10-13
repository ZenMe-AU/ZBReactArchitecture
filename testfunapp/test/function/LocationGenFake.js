const { app } = require('@azure/functions');

//This function generates random location points based on the input location and writes it to the database.
app.http('LocationGenFake', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        context.log(request.headers);
        const bodyText = await request.text();
        context.log("BODY text:", (bodyText));
        var bodyJson;
        var returnDict = {};
        try {
            bodyJson = JSON.parse(bodyText);
            context.log("BODY json:", bodyJson);
            var payload = {
                _type: ('_type' in bodyJson) ? bodyJson._type : 'location',
                topic: ('topic' in bodyJson) ? bodyJson.topic : 'owntracks/genFake',
                tid: ('tid' in bodyJson) ? bodyJson.tid : getRandomInRange(1, 100, 0),
                lat: ('lat' in bodyJson) ? bodyJson.lat : getRandomInRange(-90, 90, 5),
                lon: ('lon' in bodyJson) ? bodyJson.lon : getRandomInRange(-180, 180, 5),
            };
            if (payload.tid === 1) {payload.tid = 'l1'}
            //sent data to LocationWrite
            var url = new URL('/api/LocationWrite', request.url);
            var response = await fetch(url, {
                method: 'post' ,
                body: JSON.stringify(payload),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }) // 發送 GET 請求
            returnDict = {
                return: payload,
                response: await response.json(),
            };
        } catch (error) {
            context.log(error)
        }
        return {
            body: JSON.stringify(returnDict),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
});

function getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
}
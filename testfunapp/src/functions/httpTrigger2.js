const { app } = require('@azure/functions');
const { Location } = require('../models.js');

app.http('httpTrigger2', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        context.log(request.headers);
        const bodytext = await request.text();
        context.log("BODY text:", (bodytext));
        var bodyjson;
        try {
            bodyjson = JSON.parse(bodytext);
        } catch (error) {
            context.log(error)
        }
        context.log("BODY json:", bodyjson);
        context.log(request.params);
        //context.log(JSON.stringify(request, null, 2));
        //context.log(JSON.stringify(context, null, 2));
        try {
            let payload = bodyjson;
            if (payload['_type'] == 'location') {
                let topic = payload['topic'].split('/').pop();
                let tid = payload['tid'];
                let lat = payload['lat'];
                let lon = payload['lon'];
                context.log(`topic "${topic}"`);
                context.log(`tid "${tid}"`);
                context.log(`lat "${lat}"`);
                context.log(`lon "${lon}"`);

                //  write actual data in database
                Location.create({
                    topicId: topic,
                    tid: tid,
                    lat: lat,
                    lon: lon,
                    response: bodytext
                });


                // ---fake data process--- //
                let fakeData = [];
                let fakeNum = [];
                let limit  = 100;
                let dLimit = 0.00008;
                for (let i = 0; i <= Math.floor(Math.random() * limit); i++) {
                    fakeNum.push(Math.floor(Math.random() * (limit+1)));
                }
                fakeNum = [...new Set(fakeNum)];
                fakeNum.forEach((n) => {
                    if (n > 0) {
                        fakeData.push({
                            topicId: topic.concat('', n),
                            tid: n,
                            lat: lat + (Math.random() * dLimit * 2) + (dLimit * -1),
                            lon: lon + (Math.random() * dLimit * 2) + (dLimit * -1),
                            response: bodytext
                        })
                    }
                });
                Location.bulkCreate(fakeData, {
                    validate: true,
                });
                // ---fake data process--- //
            }
        } catch (error) { context.log(error) }
        const name = request.query.get('name') || 'world';
        return { body: `Hello, ${name}!` };
    }
});

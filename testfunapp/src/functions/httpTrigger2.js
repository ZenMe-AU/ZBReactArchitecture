const { app } = require('@azure/functions');

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
                let topic = payload['topic'];
                let tid = payload['tid'];
                let lat = payload['lat'];
                let lon = payload['lon'];
                context.log(`topic "${topic}"`);
                context.log(`tid "${tid}"`);
                context.log(`lat "${lat}"`);
                context.log(`lon "${lon}"`);
            }
        } catch (error) { context.log(error) }
        const name = request.query.get('name') || 'world';
        return { body: `Hello, ${name}!` };
    }
});

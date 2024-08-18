const { app } = require('@azure/functions');

app.http('httpTrigger1', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        context.log(JSON.stringify(request.headers, null, 2));
        context.log(JSON.stringify(request.params, null, 2));
        context.log(JSON.stringify(request, null, 2));
        context.log(JSON.stringify(context, null, 2));
        const name = request.query.get('name') || await request.text() || 'world';
        let payload = request.params;
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

        return { body: `Hello, ${name}!` };
    }
});

const { app } = require('@azure/functions');
const { Location } = require('../models.js');

app.http('httpTrigger1', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || await request.text() || 'world';

        Location.create({
            topicId: 'test',
            tid: 'testId',
            lat: 0,
            lon: 0,
            response: 'rsp'
        });
        return { body: `Hello, ${name}!` };
    }
});

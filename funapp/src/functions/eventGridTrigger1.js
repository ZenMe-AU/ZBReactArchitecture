const { app } = require('@azure/functions');
const { Location } = require('../models.js');


app.eventGrid('eventGridTrigger1', {
    handler: (event, context) => {
        context.log('hi');
        context.log('Event grid function processed event:', event);
        context.log('context:', context);

        Location.create({
            topicId: 'test1',
            tid: 'testId',
            lat: 0,
            lon: 0,
            response: 'rsp'
        });
    }
});

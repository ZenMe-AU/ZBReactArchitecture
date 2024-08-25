const { app } = require('@azure/functions');
const { sequelize }  = require('../db.js');
const { QueryTypes }  = require('sequelize');

app.http('httpTrigger1', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        let device_id = 'l1';
        let request_time = new Date().toISOString().slice(0, 16);
        if (request.query.get('datetime')) {
            request_time = new Date(request.query.get('datetime')).toISOString().slice(0, 16);
        }
        let interval = request.query.get('interval') || 60;
        let distance = (request.query.get('distance') || 10) * 0.00001;
        let limited = request.query.get('limited') || 100;
        let start_time = new Date(new Date(request_time+'Z').getTime() - (interval * 60 * 1000)).toISOString().slice(0, 16);

        let users = await getUsers(device_id, start_time,  request_time, distance, limited);

        return {
            body: JSON.stringify({return: {'users':users}}),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
});


const getUsers = (deviceId, from, to, distance, limited) => {
    let select_query = `
      SELECT   "users"."id", "location"."tid", "users"."name", "users"."avatar"
          FROM
          (SELECT "id", "topicId", "tid", "lat", "lon", "response", "createdAt" FROM "location" AS "location"
                  WHERE ("tid" = $deviceId) AND ("createdAt" BETWEEN $from AND $to)) AS "A",
            "location" left JOIN "users" ON "location"."tid" = "users"."deviceId"
            WHERE
              ("location"."tid" != "A"."tid"
  
                  and ("location"."lat" BETWEEN "A"."lat"-$distance AND "A"."lat"+$distance )
                  and ("location"."lon" BETWEEN "A"."lon"-$distance AND "A"."lon"+$distance ))
              and ("location"."createdAt" BETWEEN ("A"."createdAt" - INTERVAL '1 MINUTE') and ("A"."createdAt" + INTERVAL '1 MINUTE'))
  
          GROUP BY "users"."id", "location"."tid";
    `;
    try {
      return sequelize.query(select_query,{
        bind: { deviceId:deviceId, from:from, to:to, distance:distance },
        type: QueryTypes.SELECT,
      });
    } catch (err) {
      console.log(err)
      return [];
    }
  }
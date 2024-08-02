import express from "express";
import cors from 'cors';
import { sequelize } from './db.js';
import { QueryTypes } from 'sequelize';
import validate from './validation/validate.js';
import usersValidation from "./validation/users.js";

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  // origin: 'http://localhost:5173/',
  // optionsSuccessStatus: 200,
};

// Use CORS middleware
app.use(cors(corsOptions));
app.get('/',validate(usersValidation.getUsers), async (req, res) => {
  let device_id = 'l1';
  let request_time = new Date().toISOString().slice(0, 16);
  if (req.query.datetime) {
    request_time = new Date(req.query.datetime).toISOString().slice(0, 16);
  }
  let interval = req.query.interval || 60;
  let distance = (req.query.distance || 10) * 0.00001;
  let limited = req.query.limited || 100;
  let start_time = new Date(new Date(request_time+'Z').getTime() - (interval * 60 * 1000)).toISOString().slice(0, 16);

  let users = await getUsers(device_id, start_time,  request_time, distance, limited);
  res.json({'return': {'users':users}});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
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
import express from "express";
import cors from 'cors';
import { sequelize } from './db.js';
import { QueryTypes } from 'sequelize';
import { Users } from "./models.js";

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  // origin: 'http://localhost:5173/',
  // optionsSuccessStatus: 200,
};

// Use CORS middleware
app.use(cors(corsOptions));
app.get('/', async (req, res) => {

  let users = await getUsers();
  res.send({'return': {'users':users}});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



const getUsers = () => {
  let select_query = `
    SELECT   "users"."id", "location"."tid", "users"."name", "users"."avatar"
        FROM
        (SELECT "id", "topicId", "tid", "lat", "lon", "response", "createdAt" FROM "location" AS "location"
                WHERE ("tid" = 'l1') AND ("createdAt" BETWEEN '2024-07-27 10:00' AND '2024-07-27 11:00')) AS "A",
          "location" left JOIN "users" ON "location"."tid" = "users"."deviceId"
          WHERE
            ("location"."tid" != "A"."tid"

                and ("location"."lat" BETWEEN "A"."lat"-0.00003 AND "A"."lat"+0.00003 )
                and ("location"."lon" BETWEEN "A"."lon"-0.00003 AND "A"."lon"+0.00003 ))
            and ("location"."createdAt" BETWEEN ("A"."createdAt" - INTERVAL '1 MINUTE') and ("A"."createdAt" + INTERVAL '1 MINUTE'))

        GROUP BY "users"."id", "location"."tid";
  `;
  try {
    return sequelize.query(select_query,{
      type: QueryTypes.SELECT,
    });
  } catch (err) {
    console.log(err)
    return [];
  }
}
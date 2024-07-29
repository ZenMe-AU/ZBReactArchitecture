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
app.get('/', (req, res) => {

  let users = getUsers();
  let data = users.then(function(result) {
    return result;
  })
  // console.log('results')
  console.log(users);
  res.send({'return': {'users':data}});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



const getUsers = async() => {
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

    // return await Users.findAll();
    // console.log('All users:', JSON.stringify(users, null, 2));
    return await sequelize.query(select_query,{
      type: QueryTypes.SELECT,
    });
  } catch (err) {
    console.log(err)
    return [];
  }
}


  //   console.log();
  // let users = [
  //   {
  //     "avatar": "pic/avatar_20.jpg",
  //     "name": "user_20",
  //     "tid": "20"
  //   },
  //   {
  //     "avatar": "pic/avatar_43.jpg",
  //     "name": "user_43",
  //     "tid": "43"
  //   },
  //   {
  //     "avatar": "pic/avatar_99.jpg",
  //     "name": "user_99",
  //     "tid": "99"
  //   }
  // ];
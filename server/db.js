// const { Sequelize } = require('sequelize');
// require('dotenv').config()
import { Sequelize } from 'sequelize';
import 'dotenv/config';

export const sequelize = new Sequelize(process.env["DB_NAME"], process.env["DB_USER"], process.env["DB_PASSWORD"], {
    host: process.env["DB_SERVER"],
    port: process.env["DB_PORT"],
    dialect: 'postgres',
    "dialectOptions": {
      "ssl": true
    }
});

// try {
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }


// export function rawQuery(select_query) {
//   console.log('in')
//   // return [results, metadata] = sequelize.query(select_query);
// }

// module.exports = {sequelize};
/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

require("dotenv").config();
let dbHost;
let dbUser;
let dbPassword;

dbHost = process.env.DBHOST;
dbUser = process.env.DB_USER;
dbPassword = process.env.DB_PASSWORD ? process.env.DB_PASSWORD : null;
console.log(`Connecting to db: ${dbHost} with user: ${dbUser}\n`);

module.exports = {
  local: {
    username: dbUser,
    password: dbPassword,
    host: dbHost,
    database: "profile",
    dialect: "postgres",
  },
  test: {
    username: dbUser,
    password: dbPassword,
    database: "profile",
    host: dbHost,
    dialect: "postgres",
  },
};

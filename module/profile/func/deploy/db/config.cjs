/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

require("dotenv").config();
const usingPeerAuth = false; // Set as true if using Peer Authentication to connect to Postgres.

let dbHost;
let dbUser;
let dbPassword;

if (usingPeerAuth == true) {
  dbPassword = "null";
  dbHost = "/var/run/postgresql";
  dbUser = process.env.OS_USER;
} else {
  dbPassword = process.env.DB_PASSWORD;
  dbHost = "127.0.0.1";
  dbUser = process.env.DB_USER;
}
console.log(`Connecting to db with user: ${dbUser}\n`);

module.exports = {
  local: {
    username: dbUser,
    password: dbPassword,
    host: dbHost,
    database: "profile",
    dialect: "postgres",
  },
  test: {
    username: "root",
    password: null,
    database: "profile",
    host: "127.0.0.1",
    dialect: "postgres",
  },
};

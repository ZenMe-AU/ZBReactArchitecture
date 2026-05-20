/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

require("dotenv").config();

module.exports = {
  local: {
    username: "vscode",
    password: "vscode",
    database: "quest3Tier",
    host: "127.0.0.1",
    dialect: "postgres",
  },
  test: {
    username: "root",
    password: null,
    database: "quest3Tier",
    host: "127.0.0.1",
    dialect: "postgres",
  },
};

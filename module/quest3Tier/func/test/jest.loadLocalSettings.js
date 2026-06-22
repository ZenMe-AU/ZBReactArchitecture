/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const fs = require("fs");
const path = require("path");

function loadLocalSettings() {
  const filePath = path.join(__dirname, "..", "local.settings.json");
  if (fs.existsSync(filePath)) {
    const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const values = content.Values || {};
    for (const key in values) {
      if (!process.env[key]) {
        process.env[key] = values[key];
      }
    }
  }
}

loadLocalSettings();

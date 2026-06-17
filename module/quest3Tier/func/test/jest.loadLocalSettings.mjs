/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

function loadLocalSettings() {
  const filePath = join(__dirname, "..", "local.settings.json");
  if (existsSync(filePath)) {
    const content = JSON.parse(readFileSync(filePath, "utf8"));
    const values = content.Values || {};
    for (const key in values) {
      if (!process.env[key]) {
        process.env[key] = values[key];
      }
    }
  }
}

loadLocalSettings();

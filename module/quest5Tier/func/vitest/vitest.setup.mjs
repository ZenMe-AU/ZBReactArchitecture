/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import fs from "fs";
import path from "path";

const filePath = path.join(__dirname, "..", "local.settings.json");
const settings = JSON.parse(fs.readFileSync(filePath, "utf8"));

Object.assign(process.env, settings.Values);

/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import "./di/diInit.js";
// require("./monitoring/instrumentation");
import "./route.js";
import "./swagger/route.js";
import { app } from "@azure/functions";

app.setup({
  enableHttpStream: true,
});

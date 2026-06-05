/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import "./di/diInit.mjs";
import "./monitoring/instrumentation.mjs";
import "./route.mjs";
import "./swagger/route.mjs";
import { app } from "@azure/functions";

app.setup({
  enableHttpStream: true,
});

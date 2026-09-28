/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

require("./di/diInit.mjs");
require("./monitoring/instrumentation.mjs");
require("./route.mjs");
require("./swagger/route.mjs");
const { app } = require("@azure/functions");

app.setup({
  enableHttpStream: true,
});

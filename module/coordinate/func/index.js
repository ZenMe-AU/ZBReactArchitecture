/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

require("./di/diInit");
// require("./monitoring/instrumentation");
require("./route");
require("./swagger/route");
const { app } = require("@azure/functions");

app.setup({
  enableHttpStream: true,
});

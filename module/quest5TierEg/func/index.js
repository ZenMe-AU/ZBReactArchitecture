/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

require("./di/diInit");
require("./monitoring/instrumentation");
require("./route");
require("./swagger/route");
const { app } = require("@azure/functions");

// this file is run once, when the function app is initialized.
// You can use this function to set up app-wide settings, including connections that will be reused by all functions.
app.setup({
  enableHttpStream: true,
});

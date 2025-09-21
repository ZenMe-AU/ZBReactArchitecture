require("./di/diInit");
require("./monitoring/instrumentation");
require("./route");
require("./swagger/route");
const { app } = require("@azure/functions");

app.setup({
  enableHttpStream: true,
});

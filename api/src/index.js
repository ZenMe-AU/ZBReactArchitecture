// require("./otel-setup");
require("./instrumentation");
const { app } = require("@azure/functions");
app.setup({
  enableHttpStream: true,
});

// const appInsights = require("applicationinsights");
// appInsights
//   .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
// .setAutoDependencyCorrelation(true)
// .setAutoCollectRequests(true)
// .setAutoCollectPerformance(true, true)
// .setAutoCollectExceptions(true)
// .setAutoCollectDependencies(true)
// .setAutoCollectConsole(true)
// .setUseDiskRetryCaching(true)
// .setSendLiveMetrics(false)
// .setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
// .start();
// appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = "MyRoleName";
// appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = "FunctionApp:LocalChat";
// const client = appInsights.defaultClient;
// client.context.tags[client.context.keys.cloudRole] = "my-azure-function-app";
// appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = "your-role-name";
// appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRoleInstance] = "your-role-instance";
// appInsights.defaultClient.addTelemetryProcessor((envelope) => {
//   envelope.tags["ai.cloud.role"] = "your role name";
//   envelope.tags["ai.cloud.roleInstance"] = "your role instance";
// });

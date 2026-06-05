/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { AzureMonitorTraceExporter } from "@azure/monitor-opentelemetry-exporter";
// const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-grpc");
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
// const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-node");
// const { ErrorOrSampleProcessor } = require("./errorOrSampleProcessor");
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg";

const exporter = new AzureMonitorTraceExporter({
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
});

// const otlpExporter = new OTLPTraceExporter();
// const serviceName = process.env.SERVER_OTEL_SERVICE_NAME || "FunctionApp:LocalChat";
const serviceName = "FunctionApp:LocalChat";

console.log(`🚀 Using service name: ${serviceName} for tracing`);

const sdk = new NodeSDK({
  traceExporter: exporter,
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
  }),
  instrumentations: [new HttpInstrumentation(), new PgInstrumentation()],
  //   spanProcessors: [new ErrorOrSampleProcessor(exporter, 0.05), new ErrorOrSampleProcessor(otlpExporter, 0.05)],
});

sdk.start();

// require("./otel-setup");
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

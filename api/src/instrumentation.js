const { AzureMonitorTraceExporter } = require("@azure/monitor-opentelemetry-exporter");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-grpc");
const { resourceFromAttributes } = require("@opentelemetry/resources");
const { NodeSDK } = require("@opentelemetry/sdk-node");
const { ATTR_SERVICE_NAME, SERVICE_INSTANCE_ID } = require("@opentelemetry/semantic-conventions");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-node");
// const { ErrorOrSampleProcessor } = require("./errorOrSampleProcessor");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { PgInstrumentation } = require("@opentelemetry/instrumentation-pg");

const exporter = new AzureMonitorTraceExporter({
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
});

// const otlpExporter = new OTLPTraceExporter();
const serviceName = process.env.SERVER_OTEL_SERVICE_NAME || "FunctionApp:LocalChat";

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

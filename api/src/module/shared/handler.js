// const appInsights = require("applicationinsights");
const { trace, context: sContext, propagation, TraceFlags, SpanKind, SpanStatusCode } = require("@opentelemetry/api");
const { randomBytes } = require("crypto");

const requestHandler =
  (fn, { schemas = [], customParams = {}, requireAuth = true } = {}) =>
  async (request, context) => {
    const tracer = trace.getTracer("httpRequestTracer");
    const route = request.url || "unknown url";
    const method = request.method || "unknown method";
    const invocationId = context.invocationId || "unknown invocationId";
    const functionName = context.functionName || `${method} ${route}`;
    const correlationId = request.headers.get("X-Correlation-Id");
    const traceparent = request.headers.get("x-traceparent");
    // const parentCtx = propagation.extract(sContext.active(), { traceparent });

    // appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.operationId] = correlationId;

    const parentCtx = trace.setSpanContext(sContext.active(), buildSpanContext(correlationId));
    const span = tracer.startSpan(
      "API-" + functionName,
      {
        // kind: SpanKind.SERVER,
        attributes: {
          "http.method": method,
          "http.route": route,
          "app.method": method,
          "app.route": route,
          "app.invocation_id": invocationId,
          "app.correlation_id": correlationId,
        },
      },
      parentCtx
    );

    try {
      request.correlationId = correlationId;
      if (!request.clientParams) {
        const contentType = request.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          request.clientParams = await request.json();
        } else {
          request.clientParams = {};
        }
      }
      // todo: exit if equal 0
      if (schemas.length > 0) await validate(request, schemas);
      request.customParams = customParams;
      context.log("✨✨correlationId:", request.correlationId);
      context.log("🚧traceparent:", traceparent);
      context.log("💁functionName:", functionName);
      context.log("context:", context);
      // const path = request.url;
      // appInsights.defaultClient.trackTrace({
      //   message: `Function hit: ${path}`,
      //   properties: {
      //     // functionName: context.executionContext.functionName,
      //     correlationId: request.correlationId,
      //   },
      // });
      let result;
      await sContext.with(trace.setSpan(parentCtx, span), async () => {
        result = await fn(request, context);
        span.setStatus({ code: SpanStatusCode.OK });
      });
      return {
        status: result?.status || 200,
        headers: { "X-Correlation-Id": request.correlationId },
        jsonBody: {
          success: true,
          return: result.return,
        },
      };
    } catch (error) {
      context.log(error);
      context.log("code:", error.code || "no");
      context.log("statusCode:", error.statusCode || "no");
      context.log("message:", error.message || "no"); // "Hello"
      context.log("name:", error.name || "no");
      context.log("stack:", error.stack || "no");
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message || "error" });
      // context.log.error(error);
      // appInsights.defaultClient.trackException({
      //   exception: error,
      //   properties: {
      //     route: request.url,
      //     // functionName: context.executionContext.functionName,
      //   },
      // });

      // context.log.error("error:", error);
      // context.log.error("statusCode:", error.statusCode || "no");

      return {
        status: error.status || 500,
        headers: { "X-Correlation-Id": request.correlationId },
        jsonBody: {
          success: false,
          message: error.message || "Internal Server Error",
        },
      };
    } finally {
      span.end();
    }
  };

const serviceBusHandler = (fn) => async (message, context) => {
  context.log("context:", context);
  context.log("bindingData:", context.bindingData || "no bindingData");
  context.log("message:", message);
  const tracer = trace.getTracer("serviceBusTracer");

  const invocationId = context.invocationId || "unknown invocationId";
  const messageId = context.triggerMetadata.messageId || "unknown messageId";
  const correlationId = context.triggerMetadata.correlationId;
  const functionName = context.functionName || "unknown serviceBus";
  context.log("✨✨correlationId:", correlationId);
  context.log("💁functionName:", functionName);

  // appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.operationId] = correlationId;

  const parentCtx = trace.setSpanContext(sContext.active(), buildSpanContext(correlationId));
  const span = tracer.startSpan(
    "ServiceBus-" + functionName,
    {
      // kind: SpanKind.CONSUMER,
      attributes: {
        "app.invocation_id": invocationId,
        "app.message_id": messageId,
        "app.correlation_id": correlationId,
        "messaging.system": "azure.servicebus",
        // "messaging.destination": metadata.entityName || options.queue || "unknown",
        "messaging.operation": "process",
      },
    },
    parentCtx
  );

  try {
    await sContext.with(trace.setSpan(parentCtx, span), async () => {
      const result = await fn(message, context);
      span.setStatus({ code: SpanStatusCode.OK });
    });
    context.log(`✅ Succeed:`, message);
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message || "error" });
    context.log(`❌ Failed:`, error);
    // throw error;
  } finally {
    span.end();
  }
};

const validate = async (request, schemas) => {
  for (const schema of schemas) {
    const { error, value } = schema.validate(request.clientParams);
    if (error) {
      throw new Error("Validation failed: " + error.details[0].message);
    }
    return value;
  }
};

const buildSpanContext = (traceId) => {
  return {
    traceId,
    spanId: randomBytes(8).toString("hex"),
    traceFlags: TraceFlags.SAMPLED,
    isRemote: true,
  };
};

module.exports = {
  requestHandler,
  serviceBusHandler,
};

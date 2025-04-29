// const appInsights = require("applicationinsights");
const { trace } = require("@opentelemetry/api");

const requestHandler =
  (fn, { schemas = [], customParams = {}, requireAuth = true } = {}) =>
  async (request, context) => {
    const tracer = trace.getTracer("httpRequestTracer");
    const route = request.url || "unknown url";
    const method = request.method || "unknown method";
    const invocationId = context.invocationId || "unknown invocationId";
    const functionName = context.functionName || `${method} ${route}`;
    const correlationId = request.headers.get("X-Correlation-Id");

    const span = tracer.startSpan(functionName, {
      attributes: {
        "http.method": method,
        "http.route": route,
        "app.invocation_id": invocationId,
        "app.correlation_id": correlationId,
      },
    });

    try {
      request.correlationId = request.headers.get("X-Correlation-Id");
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
      console.log("✨correlationId:", request.correlationId);
      console.log("context:", context);
      // const path = request.url;
      // appInsights.defaultClient.trackTrace({
      //   message: `Function hit: ${path}`,
      //   properties: {
      //     // functionName: context.executionContext.functionName,
      //     correlationId: request.correlationId,
      //   },
      // });
      const result = await fn(request, context);
      span.setStatus({ code: 1 });
      return {
        status: result?.status || 200,
        headers: { "X-Correlation-Id": request.correlationId },
        jsonBody: {
          success: true,
          return: result.return,
        },
      };
    } catch (error) {
      console.log(error);
      console.log("code:", error.code || "no");
      console.log("statusCode:", error.statusCode || "no");
      console.log("message:", error.message || "no"); // "Hello"
      console.log("name:", error.name || "no");
      console.log("stack:", error.stack || "no");
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message || "error" });
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
  console.log("context:", context);
  console.log("bindingData:", context.bindingData || "no bindingData");
  console.log("message:", message);
  const tracer = trace.getTracer("serviceBusTracer");

  const invocationId = context.invocationId || "unknown invocationId";
  const messageId = context.triggerMetadata.messageId || "unknown messageId";
  const correlationId = context.triggerMetadata.correlationId || "unknown correlationId";
  const functionName = context.functionName || `${method} ${route}`;
  console.log("✨correlationId:", correlationId);

  const span = tracer.startSpan(functionName, {
    attributes: {
      "app.invocation_id": invocationId,
      "app.message_id": messageId,
      "app.correlation_id": correlationId,
      "messaging.system": "azure.servicebus",
      // "messaging.destination": metadata.entityName || options.queue || "unknown",
      "messaging.operation": "process",
    },
  });

  try {
    const result = await fn(message, context);
    span.setStatus({ code: 1 });
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: 2, message: error.message || "error" });
    throw error;
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

module.exports = {
  requestHandler,
  serviceBusHandler,
};

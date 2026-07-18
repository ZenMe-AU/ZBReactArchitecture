/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// const appInsights = require("applicationinsights");
import { trace, context as sContext, TraceFlags, SpanKind, SpanStatusCode } from "@opentelemetry/api";
import { randomBytes } from "crypto";
// const { startup } = require("../di/diRegistry");
import container from "../di/diContainer.mjs";

const requestHandler =
  (fn, { schemas = [], customParams = {}, requireAuth = true } = {}) =>
  async (request, context) => {
    // await startup();
    const tracer = trace.getTracer("httpRequestTracer");
    const route = request.url || "unknown url";
    const method = request.method || "unknown method";
    const invocationId = context.invocationId || "unknown invocationId";
    const functionName = context.functionName || `${method} ${route}`;
    const correlationId = request.headers.get("X-Correlation-Id");

    const parentCtx = trace.setSpanContext(sContext.active(), buildSpanContext(correlationId));
    const tracerSpan = tracer.startSpan(
      functionName + "-API",
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
      let user = null;
      if (requireAuth) {
        const provider = container.get("authProvider");
        const authorization = request.headers.get("authorization");
        if (!authorization) {
          const err = new Error("Authorization header is missing");
          err.status = 401;
          throw err;
        }
        const token = authorization.replace("Bearer ", "");
        const decoded = await provider.decode(token);
        const profileId = decoded.oid;
        user = { profileId };
        tracerSpan.setAttribute("app.profile_id", profileId);
      }
      request.userData = user;
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
      console.log("✨✨correlationId:", request.correlationId);
      console.log("💁functionName:", functionName);
      console.log("context:", context);
      // const path = request.url;
      // appInsights.defaultClient.trackTrace({
      //   message: `Function hit: ${path}`,
      //   properties: {
      //     // functionName: context.executionContext.functionName,
      //     correlationId: request.correlationId,
      //   },
      // });
      let result;
      await sContext.with(trace.setSpan(parentCtx, tracerSpan), async () => {
        result = await fn(request, context);
        tracerSpan.setStatus({ code: SpanStatusCode.OK });
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
      console.log(error);
      console.log("code:", error.code || "no");
      console.log("statusCode:", error.statusCode || "no");
      console.log("message:", error.message || "no"); // "Hello"
      console.log("name:", error.name || "no");
      console.log("stack:", error.stack || "no");
      tracerSpan.recordException(error);
      tracerSpan.setStatus({ code: SpanStatusCode.ERROR, message: error.message || "error" });
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
      tracerSpan.end();
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

export { requestHandler };

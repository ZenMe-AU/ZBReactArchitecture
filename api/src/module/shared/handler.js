const requestHandler =
  (fn, { schemas = [], customParams = {}, requireAuth = true } = {}) =>
  async (request, context) => {
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
      const result = await fn(request, context);
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

      return {
        status: error.status || 500,
        headers: { "X-Correlation-Id": request.correlationId },
        jsonBody: {
          success: false,
          message: error.message || "Internal Server Error",
        },
      };
    }
  };

const serviceBusHandler = (fn) => async (message, context) => {
  console.log("context:", context);
  console.log("bindingData:", context.bindingData || "no bindingData");
  console.log("message:", message);

  try {
    const result = await fn(message, context);
  } catch (error) {
    throw error;
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

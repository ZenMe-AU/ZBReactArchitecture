const validationMiddleware = require("../middleware/validationMiddleware");
// todo: rename to handler move into shared
const requestHandler =
  (fn, { schemas = [], customParams = {}, requireAuth = true }) =>
  async (request, context) => {
    try {
      if (!request.clientParams) request.clientParams = await request.json();
      // todo: exit if equal 0
      if (schemas.length > 0) await validationMiddleware(request, schemas);
      request.customParams = customParams;
      const result = await fn(request, context);
      return {
        status: result?.status || 200,
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
      // context.log.error(error);
      return {
        status: error.status || 500,
        jsonBody: {
          success: false,
          message: error.message || "Internal Server Error",
        },
      };
    }
  };

module.exports = requestHandler;

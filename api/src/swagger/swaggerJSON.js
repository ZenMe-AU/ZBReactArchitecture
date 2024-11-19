const swaggerDocs = require("./swagger.js");

module.exports = async function swaggerJSON(context, req) {
  //   context.res = {
  //     status: 200,
  //     body: swaggerDocs,
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   };
  return { jsonBody: swaggerDocs };
};

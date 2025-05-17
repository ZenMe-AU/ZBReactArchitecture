const { app } = require("@azure/functions");

const fs = require("fs");
const path = require("path");

const modulesDir = path.join(__dirname, "../module");

fs.readdirSync(modulesDir).forEach((folder) => {
  const routesPath = path.join(modulesDir, folder, "route.js");

  if (fs.existsSync(routesPath)) {
    const moduleRoutes = require(routesPath);

    moduleRoutes.forEach((route) => {
      switch (route.trigger || "http") {
        case "http":
          app.http(route.name, {
            route: route.path || route.name,
            methods: route.methods,
            extraOutputs: route.extraOutputs || [],
            authLevel: route.authLevel || "anonymous",
            handler: route.handler,
          });
          break;
        case "serviceBus":
          app.serviceBusQueue(route.name, {
            connection: route.connection || "Zmchat_SERVICEBUS",
            queueName: route.queueName || route.name,
            handler: route.handler,
          });
          break;
      }
    });
  }
});

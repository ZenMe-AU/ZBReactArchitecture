// real azure function calls
const { app } = require("@azure/functions");
// import { app } from "@azure/functions";

module.exports = class FuncClientAzure {
  type = "funcClientAzure";

  constructor() {
    console.log(`Constructed ${this.type} client`);
  }

  http(name, options) {
    app.http(name, options);
    console.log(`HTTP function created: ${name}`);
  }
  eventGrid(name, options) {
    app.eventGrid(name, options);
    console.log(`EventGrid function created: ${name}`);
  }
};

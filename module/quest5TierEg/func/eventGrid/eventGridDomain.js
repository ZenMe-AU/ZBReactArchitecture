const { output } = require("@azure/functions");

const eventGridDomain = output.eventGrid({
  connection: "EventGridConnection",
});

module.exports = {
  eventGridDomain,
};

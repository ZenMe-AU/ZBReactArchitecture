const { app } = require("@azure/functions");
const serviceBusHandler = require("../handler/serviceBusHandler.js");

app.serviceBusQueue("followUpCmdQueueTrigger", {
  connection: "Zmchat_SERVICEBUS",
  queueName: "followupcmd",
  handler: serviceBusHandler.FollowUpCmd,
});

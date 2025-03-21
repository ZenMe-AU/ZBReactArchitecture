const { app } = require("@azure/functions");
const serviceBusHandler = require("../handler/serviceBusHandler.js");

// change name
app.serviceBusQueue("sendFollowUpCmdQueue", {
  connection: "Zmchat_SERVICEBUS",
  queueName: "followupcmd",
  handler: serviceBusHandler.SendFollowUpCmd,
});

app.serviceBusQueue("shareQuestionCmdQueue", {
  connection: "Zmchat_SERVICEBUS",
  queueName: "ShareQuestionCmd",
  handler: serviceBusHandler.ShareQuestionCmd,
});

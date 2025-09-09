const { output } = require("@azure/functions");

const followUpCmdQueue = output.serviceBusQueue({
  queueName: "followupcmd",
  connection: "ServiceBusConnection",
});

const shareQuestionCmdQueue = output.serviceBusQueue({
  queueName: "shareQuestionCmd",
  connection: "ServiceBusConnection",
});

module.exports = {
  followUpCmdQueue,
  shareQuestionCmdQueue,
};

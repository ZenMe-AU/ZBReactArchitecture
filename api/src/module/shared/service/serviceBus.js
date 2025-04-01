const { output } = require("@azure/functions");

const followUpCmdQueue = output.serviceBusQueue({
  queueName: "followupcmd",
  connection: "Zmchat_SERVICEBUS",
});

const shareQuestionCmdQueue = output.serviceBusQueue({
  queueName: "shareQuestionCmd",
  connection: "Zmchat_SERVICEBUS",
});

module.exports = {
  followUpCmdQueue,
  shareQuestionCmdQueue,
};

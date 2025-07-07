const { output } = require("@azure/functions");

const sendFollowUp = output.serviceBusQueue({
  queueName: "sendFollowUp",
  connection: "Zmchat_SERVICEBUS",
});

const shareQuestion = output.serviceBusQueue({
  queueName: "shareQuestion",
  connection: "Zmchat_SERVICEBUS",
});

const createQuestion = output.serviceBusQueue({
  queueName: "createQuestion",
  connection: "Zmchat_SERVICEBUS",
});

const updateQuestion = output.serviceBusQueue({
  queueName: "updateQuestion",
  connection: "Zmchat_SERVICEBUS",
});

const createAnswer = output.serviceBusQueue({
  queueName: "createAnswer",
  connection: "Zmchat_SERVICEBUS",
});

module.exports = {
  sendFollowUp,
  shareQuestion,
  createQuestion,
  updateQuestion,
  createAnswer,
};

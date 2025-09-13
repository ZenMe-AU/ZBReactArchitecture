const { output } = require("@azure/functions");

const sendFollowUp = output.serviceBusQueue({
  queueName: "sendFollowUp",
  connection: "ServiceBusConnection",
});

const shareQuestion = output.serviceBusQueue({
  queueName: "shareQuestion",
  connection: "ServiceBusConnection",
});

const createQuestion = output.serviceBusQueue({
  queueName: "createQuestion",
  connection: "ServiceBusConnection",
});

const updateQuestion = output.serviceBusQueue({
  queueName: "updateQuestion",
  connection: "ServiceBusConnection",
});

const createAnswer = output.serviceBusQueue({
  queueName: "createAnswer",
  connection: "ServiceBusConnection",
});

module.exports = {
  sendFollowUp,
  shareQuestion,
  createQuestion,
  updateQuestion,
  createAnswer,
};

const { sendMessageToQueue } = require("../module/shared/sender.js");

async function SendQueue(request, context) {
  await sendMessageToQueue(request.customParams.queueName, request.clientParams);
  return { return: true };
}

module.exports = {
  SendQueue,
};

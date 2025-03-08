const { ServiceBusClient } = require("@azure/service-bus");

const connectionString = process.env.Zmchat_SERVICEBUS;
const sbClient = new ServiceBusClient(connectionString);

async function sendMessageToQueue(queueName, messageBody) {
  const sender = sbClient.createSender(queueName);

  try {
    console.log(`Sending message to queue: ${queueName}`);

    await sender.sendMessages({ body: messageBody });
    console.log("Message sent successfully!");
  } catch (error) {
    console.error("Failed to send message:", error);
  } finally {
    await sender.close();
  }
}

module.exports = { sendMessageToQueue };

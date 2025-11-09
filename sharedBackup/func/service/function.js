/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { ServiceBusClient } = require("@azure/service-bus");

const connectionString = process.env.Zmchat_SERVICEBUS;
const sbClient = new ServiceBusClient(connectionString);

async function sendMessageToQueue(queueName, messageBody, correlationId) {
  const sender = sbClient.createSender(queueName);

  try {
    console.log(`Sending message to queue: ${queueName}`);

    await sender.sendMessages({ body: messageBody, correlationId });
    console.log("Message sent successfully!");
  } catch (error) {
    console.error("Failed to send message:", error);
  } finally {
    await sender.close();
  }
}

module.exports = { sendMessageToQueue };

/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const container = require("../di/diContainer");
const { v4: uuidv4 } = require("uuid");

async function sendMessageToQueue({ sbClient, queueName, body, correlationId, messageId }) {
  messageId = messageId ?? uuidv4();
  sbClient = sbClient ?? container.get("serviceBus");
  const sender = sbClient.createSender(queueName);
  try {
    await sender.sendMessages({ body, correlationId, messageId, subject: queueName });
    return messageId;
  } catch (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  } finally {
    await sender.close();
  }
}

module.exports = { sendMessageToQueue };

async function sendBatchMessagesToQueue(sbClient, queueName, messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Messages must be a non-empty array");
  }

  const sender = sbClient.createSender(queueName);

  const sbMessages = messages.map((msg) => ({
    body: msg.body,
    correlationId: msg.correlationId,
    messageId: msg.messageId ?? uuidv4(),
  }));

  try {
    await sender.sendMessages(sbMessages);
    return sbMessages.map((msg) => msg.messageId);
  } catch (error) {
    throw new Error(`Failed to send batch messages: ${error.message}`);
  } finally {
    await sender.close();
  }
}

async function sendMessageToQueueWithRetry(sbClient, queueName, { body, correlationId, messageId }, retries = 3) {
  messageId = messageId ?? uuidv4();
  const sender = sbClient.createSender(queueName);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await sender.sendMessages({ body, correlationId, messageId });
      return messageId;
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Failed to send message after ${retries + 1} attempts: ${error.message}`);
      }
      await delay(2 ** attempt * 100);
    }
  }
}

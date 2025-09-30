const { createServiceBusInstance } = require("../serviceBus/connection");
let sbClient;

async function getMessageById(queueName, targetMessageId, { timeoutMs = 30000, batchSize = 50 } = {}) {
  sbClient = sbClient || (await getServiceBusClient());
  const receiver = sbClient.createReceiver(queueName);
  const start = Date.now();

  try {
    while (Date.now() - start < timeoutMs) {
      const messages = await receiver.peekMessages(batchSize);
      const matched = messages.find((m) => m.messageId === targetMessageId);

      if (matched) {
        return matched.body;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.log(`Timeout: Message '${targetMessageId}' not found within ${timeoutMs}ms`);
    return null;
  } finally {
    await receiver.close();
  }
}

async function removeMessagesByIds(queueName, targetIds, { batchSize = 50, maxWaitTimeInMs = 5000 } = {}) {
  sbClient = sbClient || (await getServiceBusClient());
  const receiver = sbClient.createReceiver(queueName);

  try {
    const removed = [];
    const toRemove = new Set(targetIds);

    const received = await receiver.receiveMessages(batchSize, { maxWaitTimeInMs });

    for (const msg of received) {
      if (toRemove.has(msg.messageId)) {
        await receiver.completeMessage(msg);
        removed.push(msg.messageId);
      } else {
        await receiver.abandonMessage(msg);
      }
    }

    return removed;
  } finally {
    await receiver.close();
  }
}

async function getServiceBusClient() {
  if (sbClient) return sbClient;

  sbClient = createServiceBusInstance({
    namespace: process.env.ServiceBusConnection__fullyQualifiedNamespace,
    clientId: process.env.ServiceBusConnection__clientId || null,
  });
  // for local development, use connection string if ServiceBusConnection is set
  if (process.env.ServiceBusConnection && process.env.ServiceBusConnection.startsWith("Endpoint=sb://localhost")) {
    sbClient = createServiceBusInstance({
      namespace: process.env.ServiceBusConnection__fullyQualifiedNamespace,
      connectionString: process.env.ServiceBusConnection,
    });
  }

  return sbClient;
}

module.exports = { getMessageById, removeMessagesByIds, getServiceBusClient };

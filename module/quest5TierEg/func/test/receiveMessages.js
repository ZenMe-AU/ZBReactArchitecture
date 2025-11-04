/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const funcClientFactory = require("../funcClient/factory.js");
const eventStore = new Map();

function registerListener(queueNames = []) {
  const container = require("../di/diContainer");
  const client = container.get("eventGrid");
  const funcClient = funcClientFactory.getClient();
  if (!Array.isArray(queueNames) || queueNames.length === 0) {
    throw new Error("registerListener requires a non-empty array of queue names");
  }

  queueNames.forEach((queueName) => {
    if (eventStore.has(queueName)) {
      console.log(`Listener for '${queueName}' already registered`);
      return;
    }

    eventStore.set(queueName, []);
    const funcMetaData = global._funcMetaData || (global._funcMetaData = require("../funcMetaData"));
    const matchingCommand = funcMetaData.commands.find((cmd) => queueName === cmd.subscriptionFilter);
    if (matchingCommand) {
      client.rawClient.on(queueName, (events) => {
        console.log(`🎉 Received events for queue '${queueName}':`, events);
        funcClient.fetchEventGrid(matchingCommand.queueFuncName, events);
      });
    }
    client.rawClient.on(queueName, (events) => {
      const normalized = Array.isArray(events) ? events : [events];
      const store = eventStore.get(queueName);
      store.push(...normalized);
      console.log(`👌 Stored ${normalized.length} events for '${queueName}'`);
      console.log(`Current stored events for '${queueName}':`, store);
    });
  });

  console.log(`🎧 Listening on queues: ${queueNames.join(", ")}`);
}

async function getMessageById(queueName, targetId, { timeoutMs = 10000, intervalMs = 200 } = {}) {
  console.log(`🔍 Waiting for message '${targetId}' in queue '${queueName}'`);
  if (!eventStore.has(queueName)) {
    throw new Error(`Queue '${queueName}' is not being listened to`);
  }

  const start = Date.now();
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      const messages = eventStore.get(queueName);
      console.log(`👀Checking ${messages.length} messages in '${queueName}' for '${targetId}'`, messages);
      const index = messages.findIndex((m) => m.id === targetId);

      if (index !== -1) {
        const [matched] = messages.splice(index, 1);
        clearInterval(timer);
        resolve(matched);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(timer);
        reject(new Error(`Timeout waiting for message '${targetId}' in '${queueName}'`));
      }
    }, intervalMs);
  });
}

module.exports = {
  registerListener,
  getMessageById,
};

const container = require("../di/diContainer");
const { v4: uuidv4 } = require("uuid");

/**
 * Send a CloudEvent using either a provided client or one from the container.
 *
 * @param {Object} params
 * @param {Object} [params.client] - An EventGrid client (from factory).
 * @param {string} params.topic - The topic name (required if no client is passed).
 * @param {string} params.source - The source of the event.
 * @param {Object} params.body - Event payload data.
 * @param {string} [params.correlationId] - Optional correlation ID.
 * @param {string} [params.messageId] - Optional custom message ID.
 */
async function sendEvent({ client, topic, source, body, correlationId, messageId }) {
  client = client ?? container.get("eventGrid");
  if (!client) {
    throw new Error(`Event Grid client for topic "${topic}" is not initialized.`);
  }
  // default messageId
  messageId = messageId ?? uuidv4();
  // build CloudEvent
  const event = [
    {
      // topic,
      id: messageId,
      type: topic, // TODO: define namespace for the types in this module
      source,
      data: body,
      time: new Date(),
      extensionAttributes: { correlationid: correlationId },
    },
  ];
  await client.sendEvents(event);
  return messageId;
}

async function sendSendFollowUpCmd({ source, body, correlationId }) {
  const funcMetaData = require("../funcMetaData");
  return sendEvent({ topic: funcMetaData.allFunctions.SendFollowUpCmd.subscriptionFilter, source, body, correlationId });
}
async function sendShareQuestionCmd({ source, body, correlationId }) {
  const funcMetaData = require("../funcMetaData");
  return sendEvent({ topic: funcMetaData.allFunctions.ShareQuestionCmd.subscriptionFilter, source, body, correlationId });
}
async function sendCreateQuestionCmd({ source, body, correlationId }) {
  const funcMetaData = require("../funcMetaData");
  return sendEvent({ topic: funcMetaData.allFunctions.CreateQuestionCmd.subscriptionFilter, source, body, correlationId });
}
async function sendUpdateQuestionCmd({ source, body, correlationId }) {
  const funcMetaData = require("../funcMetaData");
  return sendEvent({ topic: funcMetaData.allFunctions.UpdateQuestionCmd.subscriptionFilter, source, body, correlationId });
}
async function sendCreateAnswerCmd({ source, body, correlationId }) {
  const funcMetaData = require("../funcMetaData");
  return sendEvent({ topic: funcMetaData.allFunctions.CreateAnswerCmd.subscriptionFilter, source, body, correlationId });
}
async function sendFollowUpSentEvent({ source, body, correlationId, messageId }) {
  const funcMetaData = require("../funcMetaData");
  return sendEvent({ topic: funcMetaData.allFunctions.SendFollowUpCmd.eventQueueName, source, body, correlationId, messageId });
}
async function sendQuestionSharedEvent({ source, body, correlationId, messageId }) {
  const funcMetaData = require("../funcMetaData");
  return sendEvent({ topic: funcMetaData.allFunctions.ShareQuestionCmd.eventQueueName, source, body, correlationId, messageId });
}
async function sendQuestionCreatedEvent({ source, body, correlationId, messageId }) {
  const funcMetaData = require("../funcMetaData");
  return sendEvent({ topic: funcMetaData.allFunctions.CreateQuestionCmd.eventQueueName, source, body, correlationId, messageId });
}
async function sendQuestionUpdatedEvent({ source, body, correlationId, messageId }) {
  const funcMetaData = require("../funcMetaData");
  return sendEvent({ topic: funcMetaData.allFunctions.UpdateQuestionCmd.eventQueueName, source, body, correlationId, messageId });
}
async function sendAnswerCreatedEvent({ source, body, correlationId, messageId }) {
  const funcMetaData = require("../funcMetaData");
  return sendEvent({ topic: funcMetaData.allFunctions.CreateAnswerCmd.eventQueueName, source, body, correlationId, messageId });
}

module.exports = {
  sendSendFollowUpCmd,
  sendShareQuestionCmd,
  sendCreateQuestionCmd,
  sendUpdateQuestionCmd,
  sendCreateAnswerCmd,
  sendFollowUpSentEvent,
  sendQuestionSharedEvent,
  sendQuestionCreatedEvent,
  sendQuestionUpdatedEvent,
  sendAnswerCreatedEvent,
};

// async function sendEvent({ client, topic, eventType, body, correlationId, messageId }) {
//   messageId = messageId ?? uuidv4();
//   client = client ?? container.get("eventGrid");
//   // console.log("🌟 Sending event to Event Grid:", client);
//   const event = [
//     {
//       topic,
//       id: messageId,
//       type: eventType,
//       source: "/quest5TierEg/" + eventType,
//       subject: eventType,
//       data: body,
//       time: new Date(),
//       extensionAttributes: { correlationid: correlationId },
//     },
//     // {
//     //   id: messageId,
//     //   topic,
//     //   subject: "subject",
//     //   dataVersion: "1.0",
//     //   eventType: "eventType",
//     //   data: body,
//     //   eventTime: new Date().toISOString(),
//     // },
//     // {
//     //   topic,

//     //   id: "aabbccdd-1122-3344-5566-77889900aabb",
//     //   eventType: "Question.Created",
//     //   subject: "createQuestion",
//     //   data: {
//     //     questionId: "q123",
//     //     title: "example",
//     //   },
//     //   eventTime: "2025-09-29T17:00:00Z",
//     //   dataVersion: "1.0",
//     //   metadataVersion: "1",
//     // },
//   ];
//   // console.log("🛫 Event to be sent:", event);
//   try {
//     await client.send(event);
//     return messageId;
//   } catch (error) {
//     throw new Error(`Failed to send event: ${error.message}`);
//   }
// }

// module.exports = { sendEvent, sendNamespaceEvent };

// async function sendNamespaceEvent({ client, topic, source, eventType, body, correlationId, messageId }) {
//   // const { EventGridSenderClient, AzureKeyCredential } = require("@azure/eventgrid-namespaces");
//   // const { DefaultAzureCredential } = require("@azure/identity");
//   // let clientId, key;
//   // let credential = clientId ? new DefaultAzureCredential({ managedIdentityClientId: clientId }) : new DefaultAzureCredential();
//   // if (key) {
//   //   credential = new AzureKeyCredential(key);
//   // }
//   // client = new EventGridSenderClient("https://hugejunglefowl-egnamespace.australiaeast-1.eventgrid.azure.net", credential, topic);

//   client = client ?? container.get("eventGridNamespace")[topic];
//   if (!client) {
//     throw new Error(`Event Grid Namespace client for topic "${topic}" is not initialized.`);
//   }
//   // console.log("🌟 Sending event to Event Grid Namespace:", client);
//   messageId = messageId ?? uuidv4();
//   const event = [
//     {
//       topic,
//       id: messageId,
//       type: topic,
//       source: "/quest5TierEg/" + source,
//       subject: topic,
//       data: body,
//       time: new Date(),
//       extensionAttributes: { correlationid: correlationId },
//     },
//   ];
//   console.log("🛫 Sending event to Event Grid Namespace:", { client, event });
//   await client.sendEvents(event);
//   return messageId;
// }

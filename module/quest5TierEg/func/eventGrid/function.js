const container = require("../di/diContainer");
const { v4: uuidv4 } = require("uuid");

async function sendEvent({ client, topic, eventType, body, correlationId, messageId }) {
  messageId = messageId ?? uuidv4();
  client = client ?? container.get("eventGrid");
  console.log("🌟 Sending event to Event Grid:", client);
  const event = [
    {
      topic,
      id: messageId,
      type: eventType,
      source: "/quest5TierEg/" + eventType,
      subject: eventType,
      data: body,
      time: new Date(),
      //   extensionAttributes: { correlationId },
    },
    // {
    //   id: messageId,
    //   topic,
    //   subject: "subject",
    //   dataVersion: "1.0",
    //   eventType: "eventType",
    //   data: body,
    //   eventTime: new Date().toISOString(),
    // },
    // {
    //   topic,

    //   id: "aabbccdd-1122-3344-5566-77889900aabb",
    //   eventType: "Question.Created",
    //   subject: "createQuestion",
    //   data: {
    //     questionId: "q123",
    //     title: "example",
    //   },
    //   eventTime: "2025-09-29T17:00:00Z",
    //   dataVersion: "1.0",
    //   metadataVersion: "1",
    // },
  ];
  try {
    await client.send(event);
    return messageId;
  } catch (error) {
    throw new Error(`Failed to send event: ${error.message}`);
  }
}

module.exports = { sendEvent };

// async function sendEvent() {
//   const events = [
//     {
//       id: "1",
//       subject: "createQuestion",
//       eventType: "QuestionCreated",
//       eventTime: new Date(),
//       data: { question: "What is Terraform?" },
//       dataVersion: "1.0",
//     },
//   ];

//   await client.sendEvents(events);
//   console.log("Event sent using Managed Identity!");
// }

// module.exports = async function (context, req) {
//   context.log("Sending event...");
//   await sendEvent();
//   context.res = { status: 200, body: "Event sent via Managed Identity!" };
// };

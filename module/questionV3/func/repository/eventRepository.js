const { Event } = require("../db/model");
const { ACTION_TYPE } = require("../enum");

async function insertEvent({
  aggregateType,
  aggregateId,
  eventType = ACTION_TYPE.CREATE,
  causationId,
  senderId,
  eventData,
  originalData = null,
  correlationId = null,
  transaction = null,
}) {
  const options = transaction ? { transaction } : {};
  return await Event.create(
    {
      aggregateId,
      aggregateType,
      causationId,
      correlationId,
      senderProfileId: senderId,
      eventType,
      eventData,
      originalData,
    },
    options
  );
}

module.exports = {
  insertEvent,
};

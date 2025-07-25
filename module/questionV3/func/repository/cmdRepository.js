const { Cmd } = require("../db/model");
const { ACTION_TYPE } = require("../enum");

async function insertCmd({ aggregateType, action = ACTION_TYPE.CREATE, cmdId, senderId, cmdData, correlationId, transaction = null }) {
  const options = transaction ? { transaction } : {};
  return Cmd.create(
    {
      id: cmdId,
      aggregateType: aggregateType,
      correlationId: correlationId,
      senderProfileId: senderId,
      action,
      data: cmdData,
    },
    options
  );
}

async function updateCmd({ cmdId, status, eventId = null, transaction = null }) {
  const options = {};
  if (transaction) {
    options.transaction = transaction;
    options.lock = transaction.LOCK.UPDATE;
  }

  const cmd = await Cmd.findByPk(cmdId, options);
  if (!cmd) {
    throw new Error(`Cmd with ID ${cmdId} not found`);
  }
  return cmd.update(
    {
      status,
      eventId,
      // aggregateId, // Not needed here
    },
    options
  );
}

module.exports = {
  insertCmd,
  updateCmd,
};

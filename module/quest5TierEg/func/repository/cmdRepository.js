/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const BaseRepository = require("./baseRepository");
const ACTION_TYPE = require("../enum/actionType");
class CmdRepo extends BaseRepository {
  constructor() {
    super(["Cmd"]);
  }

  async insertCmd({ aggregateType, action = ACTION_TYPE.CREATE, cmdId, senderId, cmdData, correlationId, transaction = null }) {
    const options = transaction ? { transaction } : {};
    return this.Cmd.create(
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

  async updateCmd({ cmdId, status, eventId = null, transaction = null }) {
    const options = {};
    if (transaction) {
      options.transaction = transaction;
      options.lock = transaction.LOCK.UPDATE;
    }

    const cmd = await this.Cmd.findByPk(cmdId, options);
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
}
module.exports = new CmdRepo();

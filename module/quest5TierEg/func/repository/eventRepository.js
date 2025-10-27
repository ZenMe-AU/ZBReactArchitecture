const BaseRepository = require("./baseRepository");
const ACTION_TYPE = require("../enum/actionType");

class EventRepository extends BaseRepository {
  constructor() {
    super(["Event"]);
  }

  async insertEvent({
    aggregateType,
    aggregateId,
    eventType = ACTION_TYPE.CREATE,
    causationId,
    causationType,
    senderId,
    eventData,
    originalData = null,
    correlationId = null,
    transaction = null,
  }) {
    const options = transaction ? { transaction } : {};
    return await this.Event.create(
      {
        aggregateId,
        aggregateType,
        causationId,
        causationType,
        correlationId,
        senderProfileId: senderId,
        eventType,
        eventData,
        originalData,
      },
      options
    );
  }

  async searchEvent(correlationId, aggregateType) {
    return await this.Event.findAll({
      where: {
        correlationId,
        aggregateType,
      },
    });
  }
}

module.exports = new EventRepository();

const { AGGREGATE_TYPE, ACTION_TYPE } = require("../../enum");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Event",
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      aggregateId: {
        allowNull: true,
        type: DataTypes.UUID,
      },
      aggregateType: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          isIn: [Object.values(AGGREGATE_TYPE)],
        },
      },
      causationId: {
        allowNull: true,
        type: DataTypes.UUID,
      },
      correlationId: {
        allowNull: true,
        type: DataTypes.UUID,
      },
      senderProfileId: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      eventType: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          isIn: [Object.values(ACTION_TYPE)],
        },
      },
      eventData: {
        allowNull: false,
        type: DataTypes.JSON,
      },
      originalData: {
        allowNull: true,
        type: DataTypes.JSON,
      },
    },
    {
      tableName: "event",
      updatedAt: false,
    }
  );
};

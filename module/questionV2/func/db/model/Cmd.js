const { AGGREGATE_TYPE, STATUS } = require("../../enum");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Cmd",
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      aggregateType: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          isIn: [Object.values(AGGREGATE_TYPE)],
        },
      },
      eventId: {
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
      action: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      data: {
        allowNull: false,
        type: DataTypes.JSON,
      },
      status: {
        allowNull: false,
        type: DataTypes.SMALLINT,
        validate: {
          isIn: [Object.values(STATUS)],
        },
        defaultValue: STATUS.PENDING,
      },
    },
    {
      tableName: "cmd",
      timestamps: true,
    }
  );
};

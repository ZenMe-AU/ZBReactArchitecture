module.exports = (sequelize, DataTypes) => {
  const FollowUpEvent = sequelize.define(
    "FollowUpEvent",
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      followUpId: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      correlationId: {
        allowNull: true,
        type: DataTypes.UUID,
      },
      action: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      senderProfileId: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      originalData: {
        allowNull: true,
        type: DataTypes.JSON,
      },
      actionData: {
        allowNull: false,
        type: DataTypes.JSON,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "followUpEvent",
      updatedAt: false,
    }
  );
  return FollowUpEvent;
};

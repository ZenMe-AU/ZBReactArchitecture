module.exports = (sequelize, DataTypes) => {
  const QuestionLog = sequelize.define(
    "QuestionLog",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      questionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      action: {
        type: DataTypes.CHAR,
        allowNull: false,
      },
      profileId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      originalData: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      actionData: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      lastEventId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      tableName: "logQuestion",
      updatedAt: false,
    }
  );
  return QuestionLog;
};

module.exports = (sequelize, DataTypes) => {
  const QuestionShareEvent = sequelize.define(
    "QuestionShareEvent",
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      questionShareId: {
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
    },
    {
      tableName: "questionShareEvent",
      updatedAt: false,
    }
  );
  return QuestionShareEvent;
};

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "FollowUpFilter",
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      order: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.SMALLINT,
      },
      senderProfileId: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      refQuestionId: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      refOption: {
        allowNull: false,
        type: DataTypes.JSON,
      },
      questionIdList: {
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
      tableName: "followUpFilter",
      updatedAt: false,
      primaryKey: ["id", "order"],
    }
  );
};

module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define(
    "Question",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      profileId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      questionText: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      optionList: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      eventId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      tableName: "question",
      updatedAt: false,
    }
  );

  Question.associate = (models) => {
    Question.hasMany(models.QuestionAnswer, { foreignKey: "questionId", sourceKey: "id" });
    Question.hasMany(models.QuestionShare, { foreignKey: "questionId", sourceKey: "id" });
  };
  return Question;
};

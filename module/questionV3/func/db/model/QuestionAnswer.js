module.exports = (sequelize, DataTypes) => {
  const QuestionAnswer = sequelize.define(
    "QuestionAnswer",
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
        unique: "question_profile_unique",
      },
      questionId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: "question_profile_unique",
      },
      answerText: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      optionAnswerList: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      when: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "questionAnswer",
    }
  );
  QuestionAnswer.associate = (models) => {
    QuestionAnswer.belongsTo(models.Question, { targetKey: "id", foreignKey: "questionId" });
  };
  return QuestionAnswer;
};

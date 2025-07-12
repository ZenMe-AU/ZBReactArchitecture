const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");
const { AGGREGATE_TYPE, ACTION_TYPE, STATUS } = require("../../enum");

const Question = sequelize.define(
  "question",
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
    option: {
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

const QuestionAnswer = sequelize.define(
  "questionAnswer",
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
    questionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    answerText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    optionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "questionAnswer",
    updatedAt: false,
  }
);

const QuestionShare = sequelize.define(
  "questionShare",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    newQuestionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    senderProfileId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    receiverProfileId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
  },
  {
    tableName: "questionShare",
    updatedAt: false,
  }
);

const FollowUpFilter = sequelize.define(
  "followUpFilter",
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
    newQuestionId: {
      allowNull: false,
      type: DataTypes.UUID,
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

const Cmd = sequelize.define(
  "cmd",
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

const Event = sequelize.define(
  "event",
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
Question.hasMany(QuestionAnswer, { foreignKey: "questionId", sourceKey: "id" });
Question.hasMany(QuestionShare, { foreignKey: "newQuestionId", sourceKey: "id" });
QuestionAnswer.belongsTo(Question, { targetKey: "id", foreignKey: "questionId" });
QuestionShare.belongsTo(Question, { targetKey: "id", foreignKey: "newQuestionId" });

module.exports = {
  Question,
  QuestionAnswer,
  QuestionShare,
  FollowUpFilter,
  Cmd,
  Event,
};

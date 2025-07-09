const { DataTypes } = require("sequelize");
// const { sequelize } = require("./db.js");
const { sequelize } = require("../index");
// const { applyPatch } = require("fast-json-patch");
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

// const QuestionLog = sequelize.define(
//   "logQuestion",
//   {
//     id: {
//       type: DataTypes.UUID,
//       allowNull: false,
//       primaryKey: true,
//       defaultValue: DataTypes.UUIDV4,
//     },
//     questionId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//     },
//     action: {
//       type: DataTypes.CHAR,
//       allowNull: false,
//     },
//     profileId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//     },
//     originalData: {
//       type: DataTypes.JSON,
//       allowNull: true,
//     },
//     actionData: {
//       type: DataTypes.JSON,
//       allowNull: false,
//     },
//     lastEventId: {
//       type: DataTypes.UUID,
//       allowNull: true,
//     },
//   },
//   {
//     tableName: "logQuestion",
//     updatedAt: false,
//   }
// );

const QuestionAction = sequelize.define(
  "questionAction",
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
    action: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    tableName: "questionAction",
    updatedAt: false,
  }
);

const FollowUpCmd = sequelize.define(
  "followUpCmd",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
      defaultValue: 0,
    },
  },
  {
    tableName: "followUpCmd",
    timestamps: true,
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

const FollowUpEvent = sequelize.define(
  "followUpEvent",
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

const QuestionShareCmd = sequelize.define(
  "questionShareCmd",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    senderProfileId: {
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
    data: {
      allowNull: false,
      type: DataTypes.JSON,
    },
    status: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      defaultValue: 0,
    },
  },
  {
    tableName: "questionShareCmd",
    timestamps: true,
  }
);

const QuestionShareEvent = sequelize.define(
  "questionShareEvent",
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

const QuestionCmd = sequelize.define(
  "questionCmd",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    senderProfileId: {
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
    data: {
      allowNull: false,
      type: DataTypes.JSON,
    },
    status: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      defaultValue: 0,
    },
  },
  {
    tableName: "questionCmd",
    timestamps: true,
  }
);

const QuestionEvent = sequelize.define(
  "questionEvent",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    questionId: {
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
    tableName: "questionEvent",
    updatedAt: false,
  }
);

const QuestionAnswerCmd = sequelize.define(
  "questionAnswerCmd",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    senderProfileId: {
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
    data: {
      allowNull: false,
      type: DataTypes.JSON,
    },
    status: {
      allowNull: false,
      type: DataTypes.SMALLINT,
      defaultValue: 0,
    },
  },
  {
    tableName: "questionAnswerCmd",
    timestamps: true,
  }
);

const QuestionAnswerEvent = sequelize.define(
  "questionAnswerEvent",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    questionAnswerId: {
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
    tableName: "questionAnswerEvent",
    updatedAt: false,
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
  // QuestionLog,
  // QuestionAction,
  // FollowUpCmd,
  FollowUpFilter,
  // FollowUpEvent,
  // FollowUpShare,
  // QuestionShareCmd,
  // QuestionShareEvent,
  // QuestionCmd,
  // QuestionEvent,
  // QuestionAnswerCmd,
  // QuestionAnswerEvent,
  Cmd,
  Event,
};

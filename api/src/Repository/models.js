const { DataTypes } = require("sequelize");
// const { sequelize } = require("./db.js");
const { sequelize } = require("../../models/index");
const { applyPatch } = require("fast-json-patch");

const Users = sequelize.define(
  "users",
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.CHAR,
    },
    deviceId: {
      type: DataTypes.CHAR,
    },
  },
  {
    timestamps: false,
    // Other model options go here
  }
);

const Location = sequelize.define(
  "location",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    topicId: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    tid: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    lat: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    lon: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    response: {
      type: DataTypes.TEXT,
    },
    geom: {
      type: DataTypes.GEOMETRY("POINT", 4326),
    },
  },
  {
    tableName: "location",
    updatedAt: false,
  }
);

const Attributes = sequelize.define(
  "attributes",
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
    tag: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
  },
  {
    updatedAt: false,
  }
);

const Profiles = sequelize.define(
  "profiles",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    name: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.CHAR,
      allowNull: true,
    },
    deviceId: {
      type: DataTypes.CHAR,
    },
  },
  {
    timestamps: false,
    // Other model options go here
  }
);

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

const QuestionLog = sequelize.define(
  "logQuestion",
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
// Users.hasMany(Location, { foreignKey: "tid", sourceKey: "deviceId" });
// Location.belongsTo(Users, { targetKey: "deviceId", foreignKey: "tid" });
Location.belongsTo(Profiles, { targetKey: "deviceId", foreignKey: "tid" });
Attributes.belongsTo(Profiles, { targetKey: "id", foreignKey: "profileId" });
Profiles.hasMany(Attributes, { foreignKey: "profileId", sourceKey: "id" });
Profiles.hasMany(Location, { foreignKey: "tid", sourceKey: "deviceId" });
Profiles.hasMany(Question, { foreignKey: "profileId", sourceKey: "id" });
Profiles.hasMany(QuestionAnswer, { foreignKey: "profileId", sourceKey: "id" });
Question.hasMany(QuestionAnswer, { foreignKey: "questionId", sourceKey: "id" });
Question.hasMany(QuestionShare, { foreignKey: "newQuestionId", sourceKey: "id" });
QuestionAnswer.belongsTo(Question, { targetKey: "id", foreignKey: "questionId" });
QuestionShare.belongsTo(Question, { targetKey: "id", foreignKey: "newQuestionId" });

// hook
Question.addHook("afterSave", async (instance, options) => {
  if (!instance.changed("eventId")) {
    const isCreate = instance._options.isNewRecord;
    const log = await QuestionLog.create(
      {
        questionId: instance.id,
        profileId: instance.profileId,
        actionData: instance.dataValues,
        action: isCreate ? "create" : "update",
        originalData: isCreate ? null : instance._previousDataValues,
        lastEventId: isCreate ? null : instance._previousDataValues.eventId,
      },
      {
        transaction: options.transaction,
      }
    );
    // instance.eventId = log.id;
    // await instance.save();
    await instance.update({ eventId: log.id });
    // } else {
    //   console.log(instance);
  }
});

QuestionAction.addHook("afterSave", async (instance, options) => {
  try {
    const { questionId, action } = instance;
    const question = await Question.findByPk(questionId);
    if (!question) {
      console.error(`Question with ID ${questionId} not found.`);
      return;
    }
    // Apply patches to the question
    const updatedData = applyPatch(question.toJSON(), action).newDocument;
    await question.update({
      title: updatedData.title ?? null,
      questionText: updatedData.questionText ?? null,
      option: updatedData.option ?? null,
    });
    console.log(`Question with ID ${questionId} updated successfully.`);
  } catch (error) {
    console.error("Error processing afterSave hook:", error);
  }
});

// QuestionShare.addHook("afterBulkCreate", async (instances, options) => {
//   try {
//     instances.map(async (instance) => {
//       await QuestionShareEvent.create(
//         {
//           questionShareId: instance.id,
//           // correlationId: instance.correlationId,
//           action: "create",
//           // todo: fix
//           // senderProfileId: instance.senderProfileId,
//           senderProfileId: instance.senderId,
//           actionData: instance.dataValues,
//           originalData: null,
//         },
//         {
//           transaction: options.transaction,
//         }
//       );
//     });
//   } catch (error) {
//     console.error("Error processing afterBulkCreate hook:", error);
//   }
// });

QuestionShareCmd.addHook("afterUpdate", async (instance, options) => {
  try {
    if (instance.previousStatus !== 1 && instance.status === 1) {
      await QuestionShareEvent.create(
        {
          questionShareId: instance.id,
          correlationId: instance.correlationId,
          action: "create",
          senderProfileId: instance.senderProfileId,
          actionData: instance.dataValues,
          originalData: null,
        },
        {
          transaction: options.transaction,
        }
      );
    }
  } catch (error) {
    console.error("Error processing afterUpdate hook:", error);
  }
});

FollowUpCmd.addHook("afterUpdate", async (instance, options) => {
  try {
    if (instance.previousStatus !== 1 && instance.status === 1) {
      await FollowUpEvent.create(
        {
          followUpId: instance.id,
          correlationId: instance.correlationId,
          action: "create",
          senderProfileId: instance.senderProfileId,
          actionData: instance.dataValues,
          originalData: null,
        },
        {
          transaction: options.transaction,
        }
      );
    }
  } catch (error) {
    console.error("Error processing afterUpdate hook:", error);
  }
});

module.exports = {
  Users,
  Location,
  Attributes,
  Profiles,
  Question,
  QuestionAnswer,
  QuestionShare,
  QuestionLog,
  QuestionAction,
  FollowUpCmd,
  FollowUpFilter,
  FollowUpEvent,
  // FollowUpShare,
  QuestionShareCmd,
  QuestionShareEvent,
};

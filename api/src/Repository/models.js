const { DataTypes } = require("sequelize");
// const { sequelize } = require("./db.js");
const { sequelize } = require("../../models/index");

const Users = sequelize.define(
  "users",
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
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
    tableName: "location2",
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    updatedAt: false,
  }
);

const Attributes = sequelize.define(
  "attributes",
  {
    profile_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tag: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
  },
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    updatedAt: false,
  }
);

const Profiles = sequelize.define(
  "profiles",
  {
    user_id: {
      type: DataTypes.INTEGER,
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
    device_id: {
      type: DataTypes.CHAR,
    },
  },
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
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
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.CHAR,
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
  "question_answer",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    profileId: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
  },
  {
    tableName: "question_answer",
    updatedAt: false,
  }
);

const QuestionShare = sequelize.define(
  "question_share",
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
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
  },
  {
    tableName: "question_share",
    updatedAt: false,
  }
);

const QuestionLog = sequelize.define(
  "log_question",
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
      type: DataTypes.INTEGER,
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
    tableName: "log_question",
    updatedAt: false,
  }
);

// Users.hasMany(Location, { foreignKey: "tid", sourceKey: "deviceId" });
// Location.belongsTo(Users, { targetKey: "deviceId", foreignKey: "tid" });
Location.belongsTo(Profiles, { targetKey: "device_id", foreignKey: "tid" });
Attributes.belongsTo(Profiles, { targetKey: "id", foreignKey: "profile_id" });
Profiles.hasMany(Attributes, { foreignKey: "profile_id", sourceKey: "id" });
Profiles.hasMany(Location, { foreignKey: "tid", sourceKey: "device_id" });
Profiles.hasMany(Question, { foreignKey: "profileId", sourceKey: "id" });
Profiles.hasMany(QuestionAnswer, { foreignKey: "profileId", sourceKey: "id" });
Question.hasMany(QuestionAnswer, { foreignKey: "questionId", sourceKey: "id" });
QuestionAnswer.belongsTo(Question, { targetKey: "id", foreignKey: "questionId" });
QuestionShare.belongsTo(Question, { targetKey: "id", foreignKey: "questionId" });

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

module.exports = {
  Users,
  Location,
  Attributes,
  Profiles,
  Question,
  QuestionAnswer,
  QuestionShare,
  QuestionLog,
};

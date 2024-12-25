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
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.CHAR,
      allowNull: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    option: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "question",
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    updatedAt: false,
  }
);

const QuestionAnswer = sequelize.define(
  "question_answer",
  {
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    option: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
  },
  {
    tableName: "question_answer",
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
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

module.exports = {
  Users,
  Location,
  Attributes,
  Profiles,
  Question,
  QuestionAnswer,
};

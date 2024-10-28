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
    user_id: {
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

Users.hasMany(Location, { foreignKey: "tid", sourceKey: "deviceId" });
Users.hasMany(Attributes, { foreignKey: "user_id", sourceKey: "id" });
Location.belongsTo(Users, { targetKey: "deviceId", foreignKey: "tid" });
Attributes.belongsTo(Attributes, { targetKey: "id", foreignKey: "user_id" });

module.exports = {
  Users,
  Location,
  Attributes,
};

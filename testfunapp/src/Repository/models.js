const { DataTypes } = require("sequelize");
const { sequelize } = require("./db.js");

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

Users.hasMany(Location, { foreignKey: "tid", sourceKey: "deviceId" });
Location.belongsTo(Users, { targetKey: "deviceId", foreignKey: "tid" });

module.exports = {
  Users,
  Location,
};

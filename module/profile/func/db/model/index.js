const { DataTypes } = require("sequelize");
const { sequelize } = require("../");

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

Attributes.belongsTo(Profiles, { targetKey: "id", foreignKey: "profileId" });
Profiles.hasMany(Attributes, { foreignKey: "profileId", sourceKey: "id" });

module.exports = {
  Profiles,
  Attributes,
};

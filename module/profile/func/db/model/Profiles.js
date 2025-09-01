module.exports = (sequelize, DataTypes) => {
  const Profiles = sequelize.define(
    "Profiles",
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
      tableName: "profiles",
      timestamps: false,
    }
  );

  Profiles.associate = (models) => {
    Profiles.hasMany(models.Attributes, { foreignKey: "profileId", sourceKey: "id" });
  };
  return Profiles;
};

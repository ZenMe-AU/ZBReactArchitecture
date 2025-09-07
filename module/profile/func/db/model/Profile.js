module.exports = (sequelize, DataTypes) => {
  const Profile = sequelize.define(
    "Profile",
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

  Profile.associate = (models) => {
    Profile.hasMany(models.Attribute, { as: "Attribute", foreignKey: "profileId", sourceKey: "id" });
  };
  return Profile;
};

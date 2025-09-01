module.exports = (sequelize, DataTypes) => {
  const Attributes = sequelize.define(
    "Attributes",
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
      tableName: "attributes",
      updatedAt: false,
    }
  );

  Attributes.associate = (models) => {
    Attributes.belongsTo(models.Profiles, { targetKey: "id", foreignKey: "profileId" });
  };
  return Attributes;
};

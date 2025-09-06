module.exports = (sequelize, DataTypes) => {
  const Attribute = sequelize.define(
    "Attribute",
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

  Attribute.associate = (models) => {
    Attribute.belongsTo(models.Profile, { as: "Profile", targetKey: "id", foreignKey: "profileId" });
  };
  return Attribute;
};

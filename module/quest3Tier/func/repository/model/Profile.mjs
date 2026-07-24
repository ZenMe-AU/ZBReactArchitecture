/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

export default (sequelize, DataTypes) => {
  const Profile = sequelize.define(
    "Profile",
    {
      internal_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      external_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: false,
        defaultValue: DataTypes.UUIDV4,
      },
    },
    {
      tableName: "profile",
      updatedAt: false,
    }
  );
  return Profile;
};

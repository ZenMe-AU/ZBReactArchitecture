/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../");

const Location = sequelize.define(
  "location",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
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
    tableName: "location",
    updatedAt: false,
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

module.exports = {
  Location,
  Attributes,
};

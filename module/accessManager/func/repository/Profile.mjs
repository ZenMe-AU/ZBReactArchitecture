/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { v4 as uuidv4 } from "uuid";
import {
  createTableEntity,
  getTableEntity,
  listTableEntities,
  updateTableEntity,
  deleteTableEntity,
  escapeTableFilterValue,
} from "./tableCrud.mjs";

export default (tableClient) => ({
  /**
   * Create a Profile entity.
   * @param {{internal_id?: string, external_id: string}} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    const internalId = data.internal_id || uuidv4();

    const entity = {
      partitionKey: "Profile", //Makes querying all profiles easier
      rowKey: internalId,
      internal_id: internalId,
      external_id: data.external_id,
      createdAt: new Date(),
    };

    return createTableEntity(tableClient, entity);
  },

  /**
   * Find a profile by internal_id.
   * @param {string} internalId
   * @returns {Promise<Object|null>}
   */
  async findByCompositeKey(internalId) {
    return getTableEntity(tableClient, "Profile", internalId);
  },

  async findOne({ where } = {}) {
    const externalId = where?.external_id;
    if (!externalId) return null;

    const entities = await listTableEntities(tableClient, `external_id eq '${escapeTableFilterValue(externalId)}'`);
    return entities[0] ?? null;
  },

  /**
   * Find profiles using a filter.
   * @param {string} [filter]
   * @returns {Promise<Object[]>}
   */
  async findAll(filter) {
    return listTableEntities(tableClient, filter);
  },

  /**
   * Update a profile.
   * @param {{internal_id: string, external_id: string}} data
   * @returns {Promise<Object>}
   */
  async update(data) {
    const entity = {
      partitionKey: "Profile",
      rowKey: data.internal_id,
      internal_id: data.internal_id,
      external_id: data.external_id,
    };

    return updateTableEntity(tableClient, entity);
  },

  /**
   * Delete a profile.
   * @param {string} internalId
   * @returns {Promise<void>}
   */
  async delete(internalId) {
    return deleteTableEntity(tableClient, "Profile", internalId);
  },
});

/*
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
      },
    },
    {
      tableName: "profile",
      updatedAt: false,
    }
  );
  return Profile;
}; */

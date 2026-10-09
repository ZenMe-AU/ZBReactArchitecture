/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

export const escapeTableFilterValue = (value) => String(value).replaceAll("'", "''");

export const serialiseJson = (value) => (typeof value === "string" ? value : JSON.stringify(value));

export async function createTableEntity(tableClient, entity) {
  await tableClient.createEntity(entity);
  return entity;
}

export async function getTableEntity(tableClient, partitionKey, rowKey) {
  try {
    return await tableClient.getEntity(partitionKey, rowKey);
  } catch (error) {
    if (error.statusCode === 404) return null;
    throw error;
  }
}

export async function findTableEntityByRowKey(tableClient, rowKey) {
  const filter = `RowKey eq '${escapeTableFilterValue(rowKey)}'`;
  for await (const entity of tableClient.listEntities({ queryOptions: { filter } })) {
    return entity;
  }
  return null;
}

export async function listTableEntities(tableClient, filter) {
  const filterString = typeof filter === "string" ? filter.trim() : "";
  const queryOptions = filterString ? { filter: filterString } : undefined;
  const entities = [];

  for await (const entity of tableClient.listEntities({ queryOptions })) {
    entities.push(entity);
  }

  return entities;
}

export async function updateTableEntity(tableClient, entity, mode = "Merge") {
  await tableClient.updateEntity(entity, mode);
  return entity;
}

export async function deleteTableEntity(tableClient, partitionKey, rowKey) {
  try {
    await tableClient.deleteEntity(partitionKey, rowKey);
    return true;
  } catch (error) {
    if (error.statusCode === 404) return false;
    throw error;
  }
}
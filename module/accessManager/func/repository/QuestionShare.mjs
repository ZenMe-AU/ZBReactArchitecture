/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { v4 as uuidv4 } from "uuid";
import {
  createTableEntity,
  deleteTableEntity,
  escapeTableFilterValue,
  getTableEntity,
  listTableEntities,
  updateTableEntity,
} from "./tableCrud.mjs";

const filterFields = {
  id: "RowKey",
  rowKey: "RowKey",
  receiverId: "PartitionKey",
  receiverProfileId: "PartitionKey",
  senderProfileId: "senderProfileId",
  newQuestionId: "newQuestionId",
  status: "status",
  type: "type",
};

function toEntity(data) {
  const receiverProfileId = data?.receiverProfileId ?? data?.receiverId;
  if (!receiverProfileId || !data.newQuestionId || !data.senderProfileId) {
    throw new Error("QuestionShare requires newQuestionId, senderProfileId, and receiverProfileId.");
  }

  return {
    partitionKey: receiverProfileId,
    rowKey: data.id || data.rowKey || uuidv4(),
    newQuestionId: data.newQuestionId,
    senderProfileId: data.senderProfileId,
    receiverProfileId,
    status: data.status ?? 0,
    type: data.type ?? 0,
    createdAt: data.createdAt || new Date(),
  };
}

function buildFilter(filter) {
  if (typeof filter === "string") return filter;

  const where = filter?.where ?? filter ?? {};
  return Object.entries(where)
    .filter(([key, value]) => filterFields[key] && value != null)
    .map(([key, value]) => {
      const field = filterFields[key];
      if (typeof value === "number" || typeof value === "boolean") return `${field} eq ${value}`;
      return `${field} eq '${escapeTableFilterValue(value)}'`;
    })
    .join(" and ");
}

export default (tableClient, Question) => ({
  async create(data) {
    return createTableEntity(tableClient, toEntity(data));
  },

  async bulkCreate(items) {
    if (!Array.isArray(items)) {
      throw new Error("QuestionShare bulkCreate requires an array.");
    }
    return Promise.all(items.map((item) => this.create(item)));
  },

  async findByCompositeKey(id, receiverProfileId) {
    return getTableEntity(tableClient, receiverProfileId, id);
  },

  async findAll(filter = {}) {
    const shares = await listTableEntities(tableClient, buildFilter(filter));
    if (!filter?.include?.length || !Question) return shares;

    const attributes = filter.include[0].attributes;
    return Promise.all(
      shares.map(async (share) => {
        const question = await Question.findByPk(share.newQuestionId);
        if (!question) return { ...share, Question: null };

        const selectedAttributes = Array.isArray(attributes)
          ? Object.fromEntries(attributes.map((attribute) => [attribute, question[attribute]]))
          : question;
        if (typeof selectedAttributes.option === "string") {
          selectedAttributes.option = JSON.parse(selectedAttributes.option);
        }
        return { ...share, Question: selectedAttributes };
      })
    );
  },

  async update(data) {
    const receiverProfileId = data?.receiverProfileId ?? data?.receiverId ?? data?.partitionKey;
    const id = data?.id ?? data?.rowKey;
    if (!receiverProfileId || !id) {
      throw new Error("QuestionShare update requires receiverProfileId and id.");
    }

    const existing = await getTableEntity(tableClient, receiverProfileId, id);
    if (!existing) return null;

    const entity = {
      ...existing,
      ...toEntity({ ...existing, ...data, receiverProfileId, id }),
      partitionKey: receiverProfileId,
      rowKey: id,
    };
    return updateTableEntity(tableClient, entity);
  },

  async delete(id, receiverProfileId) {
    return deleteTableEntity(tableClient, receiverProfileId, id);
  },
});

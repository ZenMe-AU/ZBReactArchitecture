/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { v4 as uuidv4 } from "uuid";

import {
  initializeTables,
  questionRepository,
  followUpCmdRepository,
  followUpEventRepository,
  rawFollowUpCmdClient,
  rawFollowUpEventClient,
  rawQuestionClient,
} from "../repository/tableClient.mjs";

describe("azure table repository CRUD", () => {
  const createdQuestionIds = [];
  const createdFollowUpIds = [];

  beforeAll(async () => {
    await initializeTables();
  });

  afterAll(async () => {
    for (const questionId of createdQuestionIds) {
      await questionRepository.destroy({ id: questionId });
    }

    for (const { senderProfileId, id } of createdFollowUpIds) {
      try {
        await rawFollowUpCmdClient.deleteEntity(senderProfileId, id);
      } catch {
        // ignore missing cleanup rows
      }

      for await (const entity of rawFollowUpEventClient.listEntities({
        filter: `followUpId eq '${id}'`,
      })) {
        try {
          await rawFollowUpEventClient.deleteEntity(entity.partitionKey, entity.rowKey);
        } catch {
          // ignore cleanup races
        }
      }
    }
  });

  it("creates, reads, updates and deletes a question", async () => {
    const profileId = uuidv4();
    const created = await questionRepository.create({
      profileId,
      title: "vitest-table-create",
      questionText: "CRUD create from Azure Table repository",
      option: [{ id: "A", text: "one" }],
    });

    createdQuestionIds.push(created.rowKey);

    expect(created).toBeTruthy();
    expect(created.rowKey).toBeTruthy();
    expect(created.questionText).toBe("CRUD create from Azure Table repository");

    const found = await questionRepository.findByPk(created.rowKey);
    expect(found).toBeTruthy();
    expect(found.rowKey).toBe(created.rowKey);

    const updated = await questionRepository.update({
      id: created.rowKey,
      profileId,
      title: "vitest-table-updated",
      questionText: "CRUD update from Azure Table repository",
    });

    expect(updated).toBeTruthy();
    expect(updated.title).toBe("vitest-table-updated");
    expect(updated.questionText).toBe("CRUD update from Azure Table repository");

    const deletedRows = await questionRepository.destroy({ id: created.rowKey });
    const afterDelete = await questionRepository.findByPk(created.rowKey);

    expect(deletedRows).toBe(1);
    expect(afterDelete).toBeNull();

    createdQuestionIds.pop();
  });

  it("creates and updates a follow-up command and emits an event", async () => {
    const senderProfileId = uuidv4();
    const correlationId = uuidv4();
    const cmd = await followUpCmdRepository.create({
      senderProfileId,
      correlationId,
      action: "create",
      data: { source: "vitest" },
      status: 0,
    });

    createdFollowUpIds.push({ senderProfileId, id: cmd.rowKey });

    const updated = await followUpCmdRepository.update(
      {
        ...cmd,
        previousStatus: cmd.status,
        status: 1,
        senderProfileId,
        id: cmd.rowKey,
        action: "create",
        data: { source: "vitest" },
      },
      { FollowUpEventTableClient: rawFollowUpEventClient }
    );

    expect(updated).toBeTruthy();
    expect(updated.status).toBe(1);

    const matchingEvents = [];
    for await (const entity of rawFollowUpEventClient.listEntities({
      filter: `followUpId eq '${cmd.rowKey}'`,
    })) {
      matchingEvents.push(entity);
    }

    expect(matchingEvents.length).toBeGreaterThan(0);
    expect(matchingEvents[0].followUpId).toBe(cmd.rowKey);
    expect(matchingEvents[0].senderProfileId).toBe(senderProfileId);
  });

  it("reads question entities by partition and row key", async () => {
    const profileId = uuidv4();
    const question = await questionRepository.create({
      profileId,
      title: "vitest-table-query",
      questionText: "Query by partition and row key",
      option: [{ id: "A", text: "one" }],
    });

    createdQuestionIds.push(question.rowKey);

    const byPartition = await questionRepository.findAll({ where: { profileId } });
    const byRowKey = await questionRepository.findByPk(question.rowKey);

    expect(byPartition.some((entity) => entity.rowKey === question.rowKey)).toBe(true);
    expect(byRowKey).toBeTruthy();
    expect(byRowKey.rowKey).toBe(question.rowKey);
  });
});

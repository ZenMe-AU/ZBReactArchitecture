/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { randomUUID } from "crypto";
import { odata } from "@azure/data-tables";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import sqlRepository from "../../repository/sql/repository.mjs";
import { initSqlRepository, initTableRepository } from "../util/repositoriesInit.mjs";
import tableRepository from "../../repository/table/repository.mjs";
import { getTableClient } from "../../repository/table/tableClient.mjs";
import { QUESTION_DATA_TABLE } from "../../repository/table/keys.mjs";
import type { QuestRepository } from "../../repository/contracts.mjs";
import cmdName from "../../enum/cmdName.mjs";

async function cleanupTableRows(profileIds: string[], externalIds: string[]) {
  const questionData = await getTableClient(QUESTION_DATA_TABLE);
  for (const profileId of profileIds) {
    const rows = questionData.listEntities({ queryOptions: { filter: odata`PartitionKey eq ${profileId}` } });
    for await (const row of rows) await questionData.deleteEntity(row.partitionKey, row.rowKey);
  }

  const profiles = await getTableClient("Profiles");
  for (const profileId of profileIds) await profiles.deleteEntity(profileId, "profile");

  const profileIndexes = await getTableClient("ProfileByExternalId");
  for (const externalId of externalIds) await profileIndexes.deleteEntity(externalId, "profile");
}

interface RepositoryTestIds {
  profileIds: string[];
  externalIds: string[];
  questionIds: string[];
  followUpCmdIds: string[];
  questionShareCmdIds: string[];
}

function createRepositoryTestIds(): RepositoryTestIds {
  return { profileIds: [], externalIds: [], questionIds: [], followUpCmdIds: [], questionShareCmdIds: [] };
}

async function cleanupSqlRows(models: Awaited<ReturnType<typeof initSqlRepository>>["models"], ids: RepositoryTestIds) {
  if (ids.questionIds.length > 0) {
    await models.QuestionAnswer.destroy({ where: { questionId: ids.questionIds } });
    await models.QuestionShare.destroy({ where: { newQuestionId: ids.questionIds } });
    await models.FollowUpFilter.destroy({ where: { newQuestionId: ids.questionIds } });
    await models.QuestionAction.destroy({ where: { questionId: ids.questionIds } });
    await models.QuestionLog.destroy({ where: { questionId: ids.questionIds } });
    await models.Question.destroy({ where: { id: ids.questionIds } });
  }
  if (ids.followUpCmdIds.length > 0) {
    await models.FollowUpEvent.destroy({ where: { followUpId: ids.followUpCmdIds } });
    await models.FollowUpCmd.destroy({ where: { id: ids.followUpCmdIds } });
  }
  if (ids.questionShareCmdIds.length > 0) {
    await models.QuestionShareEvent.destroy({ where: { questionShareId: ids.questionShareCmdIds } });
    await models.QuestionShareCmd.destroy({ where: { id: ids.questionShareCmdIds } });
  }
  if (ids.profileIds.length > 0) await models.Profile.destroy({ where: { internal_id: ids.profileIds } });
}

function testRepositoryContract(repository: QuestRepository, ids: RepositoryTestIds) {
  it("testRepositoryContract: question, answer, share, and follow-up", async () => {
    async function createTestProfile(label: string) {
      const externalId = `questdb-${label}-${randomUUID()}`;
      ids.externalIds.push(externalId);
      const profile = await repository.createProfile(externalId);
      ids.profileIds.push(profile.id);
      await expect(repository.findProfileByExternalId(externalId)).resolves.toEqual(profile);
      return profile;
    }

    const owner = await createTestProfile("owner");
    const responder = await createTestProfile("responder");
    const receiver = await createTestProfile("receiver");

    const question = await repository.create(owner.id, "Quest DB", "Which option?", ["yes", "no"]);
    ids.questionIds.push(question.id);
    await expect(repository.getById(question.id)).resolves.toMatchObject({
      id: question.id,
      profileId: owner.id,
      title: "Quest DB",
      questionText: "Which option?",
      option: ["yes", "no"],
    });
    await expect(repository.getCombinationListByUser(owner.id)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: question.id })])
    );

    await expect(repository.updateById(question.id, "Updated Quest DB", "Which option?", ["yes", "no", "maybe"])).resolves.toEqual({ id: question.id });
    await expect(repository.patchById(question.id, [{ op: "replace", path: "/title", value: "Patched Quest DB" }], owner.id)).resolves.toMatchObject({ id: expect.any(String) });
    await expect(repository.getById(question.id)).resolves.toMatchObject({ title: "Patched Quest DB", option: ["yes", "no", "maybe"] });

    const answer = await repository.addAnswerByQuestionId(question.id, responder.id, 15, "yes", "yes");
    await expect(repository.getAnswerById(question.id, answer.id)).resolves.toMatchObject({
      id: answer.id,
      questionId: question.id,
      profileId: responder.id,
      answerText: "yes",
      optionId: "yes",
      duration: 15,
    });
    await expect(repository.getAnswerListByQuestionId(question.id)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ profileId: responder.id, answerCount: 1, optionId: "yes" })])
    );

    await expect(repository.shareQuestion(question.id, owner.id, [receiver.id])).resolves.toHaveLength(1);
    await expect(repository.getSharedQuestionListByProfileId(receiver.id)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: question.id, profileId: owner.id })])
    );

    const correlationId = randomUUID();
    const followUpData = {
      save: true,
      newQuestionId: question.id,
      question: [{ questionId: question.id, option: ["yes"] }],
    };
    const followUp = await repository.insertFollowUpCmd(owner.id, followUpData, correlationId);
    ids.followUpCmdIds.push(followUp.id);
    await expect(repository.insertFollowUpFilter(owner.id, followUpData)).resolves.toHaveLength(1);
    await repository.updateFollowUpCmdStatus(followUp.id);
    await expect(repository.getEventByCorrelationId(cmdName.FollowUpCmd, correlationId)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ followUpId: followUp.id, senderProfileId: owner.id })])
    );

    const shareCorrelationId = randomUUID();
    const shareCommand = await repository.insertQuestionShareCmd(owner.id, { newQuestionId: question.id, receiverIds: [receiver.id] }, shareCorrelationId);
    ids.questionShareCmdIds.push(shareCommand.id);
    await repository.updateQuestionShareCmdStatus(shareCommand.id);
    await expect(repository.getEventByCorrelationId(cmdName.QuestionShareCmd, shareCorrelationId)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ questionShareId: shareCommand.id, senderProfileId: owner.id })])
    );
  }, 30000);
}

describe("Test SQL repository", () => {
  let sequelize: Awaited<ReturnType<typeof initSqlRepository>>["sequelize"] | undefined;
  let models: Awaited<ReturnType<typeof initSqlRepository>>["models"];
  const ids = createRepositoryTestIds();

  beforeAll(async () => {
    ({ sequelize, models } = await initSqlRepository());
  });

  afterAll(async () => {
    try {
      if (models) await cleanupSqlRows(models, ids);
    } finally {
      if (sequelize) await sequelize.close();
    }
  });

  testRepositoryContract(sqlRepository, ids);
});

describe("Test Azure Table repository", () => {
  const ids = createRepositoryTestIds();

  beforeAll(() => {
    initTableRepository();
  });
  afterAll(async () => {
    if (ids.profileIds.length > 0) await cleanupTableRows(ids.profileIds, ids.externalIds);
  });

  testRepositoryContract(tableRepository, ids);
});

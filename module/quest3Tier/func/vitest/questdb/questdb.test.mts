/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { odata } from "@azure/data-tables";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import sqlRepository, { initRepository } from "../../repository/sql/repository.mjs";
import tableRepository from "../../repository/table/repository.mjs";
import { getTableClient } from "../../repository/table/tableClient.mjs";
import { QUESTION_DATA_TABLE } from "../../repository/table/keys.mjs";
import type { QuestRepository } from "../../repository/contracts.mjs";
import cmdName from "../../enum/cmdName.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadLocalSettingsIntoEnv() {
  const settingsPath = path.join(__dirname, "..", "..", "local.settings.json");
  if (!fs.existsSync(settingsPath)) return;

  const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  if (settings?.Values) Object.assign(process.env, settings.Values);
}

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

function testRepositoryContract(kind: "sql" | "table", repository: QuestRepository) {
  let sequelize;
  let models;
  const profileIds: string[] = [];
  const externalIds: string[] = [];
  const questionIds: string[] = [];
  const followUpCmdIds: string[] = [];
  const questionShareCmdIds: string[] = [];

  beforeAll(async () => {
    loadLocalSettingsIntoEnv();
    if (kind === "sql") {
      ({ sequelize, models } = await initRepository({
        username: process.env.DB_USERNAME,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        ignoreMigrationState: process.env.DB_IGNORE_MIGRATION_STATE,
      }));
    }
  });

  afterAll(async () => {
    try {
      if (kind === "table") {
        if (profileIds.length > 0) await cleanupTableRows(profileIds, externalIds);
      } else if (models) {
      //   if (questionIds.length > 0) {
      //     await models.QuestionAnswer.destroy({ where: { questionId: questionIds } });
      //     await models.QuestionShare.destroy({ where: { newQuestionId: questionIds } });
      //     await models.FollowUpFilter.destroy({ where: { newQuestionId: questionIds } });
      //     await models.QuestionAction.destroy({ where: { questionId: questionIds } });
      //     await models.QuestionLog.destroy({ where: { questionId: questionIds } });
      //     await models.Question.destroy({ where: { id: questionIds } });
      //   }
      //   if (followUpCmdIds.length > 0) {
      //     await models.FollowUpEvent.destroy({ where: { followUpId: followUpCmdIds } });
      //     await models.FollowUpCmd.destroy({ where: { id: followUpCmdIds } });
      //   }
      //   if (questionShareCmdIds.length > 0) {
      //     await models.QuestionShareEvent.destroy({ where: { questionShareId: questionShareCmdIds } });
      //     await models.QuestionShareCmd.destroy({ where: { id: questionShareCmdIds } });
      //   }
      //   if (profileIds.length > 0) await models.Profile.destroy({ where: { internal_id: profileIds } });
      }
    } finally {
      if (sequelize) await sequelize.close();
    }
  });

  it("runs question, answer, share, and follow-up operations through the contract", async () => {
    async function createTestProfile(label: string) {
      const externalId = `questdb-${label}-${randomUUID()}`;
      externalIds.push(externalId);
      const profile = await repository.createProfile(externalId);
      profileIds.push(profile.id);
      await expect(repository.findProfileByExternalId(externalId)).resolves.toEqual(profile);
      return profile;
    }

    const owner = await createTestProfile("owner");
    const responder = await createTestProfile("responder");
    const receiver = await createTestProfile("receiver");

    const question = await repository.create(owner.id, "Quest DB", "Which option?", ["yes", "no"]);
    questionIds.push(question.id);
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
    followUpCmdIds.push(followUp.id);
    await expect(repository.insertFollowUpFilter(owner.id, followUpData)).resolves.toHaveLength(1);
    await repository.updateFollowUpCmdStatus(followUp.id);
    await expect(repository.getEventByCorrelationId(cmdName.FollowUpCmd, correlationId)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ followUpId: followUp.id, senderProfileId: owner.id })])
    );

    const shareCorrelationId = randomUUID();
    const shareCommand = await repository.insertQuestionShareCmd(owner.id, { newQuestionId: question.id, receiverIds: [receiver.id] }, shareCorrelationId);
    questionShareCmdIds.push(shareCommand.id);
    await repository.updateQuestionShareCmdStatus(shareCommand.id);
    await expect(repository.getEventByCorrelationId(cmdName.QuestionShareCmd, shareCorrelationId)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ questionShareId: shareCommand.id, senderProfileId: owner.id })])
    );
  }, 30000);
}

describe("Test SQL repository", () => {
  testRepositoryContract("sql", sqlRepository);
});

describe("Test Azure Table repository", () => {
  testRepositoryContract("table", tableRepository);
});

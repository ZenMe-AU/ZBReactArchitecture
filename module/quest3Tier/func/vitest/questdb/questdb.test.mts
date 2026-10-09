/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "crypto";

import { initDbConnection } from "../../sqlRepository/initDbConnection.mjs";
import sqlRepository from "../../sqlRepository/repository.mjs";
import type { QuestRepository } from "../../repository/contracts.mjs";
import cmdName from "../../enum/cmdName.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repository: QuestRepository = sqlRepository;

function loadLocalSettingsIntoEnv() {
  const settingsPath = path.join(__dirname, "..", "..", "local.settings.json");
  if (!fs.existsSync(settingsPath)) return;

  const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  if (settings?.Values) Object.assign(process.env, settings.Values);
}

describe("Quest DB repository contract", () => {
  let sequelize;
  let models;
  const profileIds: string[] = [];
  const questionIds: string[] = [];
  const followUpCmdIds: string[] = [];

  beforeAll(async () => {
    loadLocalSettingsIntoEnv();
    ({ sequelize, models } = await initDbConnection());
  });

  afterAll(async () => {
    try {
      if (questionIds.length > 0) {
        await models.QuestionAnswer.destroy({ where: { questionId: questionIds } });
        await models.QuestionShare.destroy({ where: { newQuestionId: questionIds } });
        await models.FollowUpFilter.destroy({ where: { newQuestionId: questionIds } });
        await models.QuestionAction.destroy({ where: { questionId: questionIds } });
        await models.QuestionLog.destroy({ where: { questionId: questionIds } });
        await models.Question.destroy({ where: { id: questionIds } });
      }
      if (followUpCmdIds.length > 0) {
        await models.FollowUpEvent.destroy({ where: { followUpId: followUpCmdIds } });
        await models.FollowUpCmd.destroy({ where: { id: followUpCmdIds } });
      }
      if (profileIds.length > 0) {
        await models.Profile.destroy({ where: { internal_id: profileIds } });
      }
    } finally {
      if (sequelize) await sequelize.close();
    }
  });

  it("runs the question, answer, share, and follow-up flow through the repository contract", async () => {
    const owner = await repository.createProfile(`questdb-owner-${randomUUID()}`);
    const responder = await repository.createProfile(`questdb-responder-${randomUUID()}`);
    const receiver = await repository.createProfile(`questdb-receiver-${randomUUID()}`);
    profileIds.push(owner.id, responder.id, receiver.id);

    const question = await repository.create(owner.id, "Quest DB", "Which option?", ["yes", "no"]);
    questionIds.push(question.id);

    await expect(repository.getById(question.id)).resolves.toMatchObject({
      id: question.id,
      profileId: owner.id,
      title: "Quest DB",
      questionText: "Which option?",
      option: ["yes", "no"],
    });
    await expect(repository.getCombinationListByUser(owner.id)).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ id: question.id })]));

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

    await repository.shareQuestion(question.id, owner.id, [receiver.id]);
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
    await repository.insertFollowUpFilter(owner.id, followUpData);
    await repository.updateFollowUpCmdStatus(followUp.id);

    await expect(repository.getEventByCorrelationId(cmdName.FollowUpCmd, correlationId)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ followUpId: followUp.id, senderProfileId: owner.id })])
    );
  });
});
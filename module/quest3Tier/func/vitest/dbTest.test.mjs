/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { v4 as uuidv4 } from "uuid";

import DB_TYPE from "../enum/dbType.mjs";
import container from "../di/diContainer.mjs";
import models from "../repository/model/index.mjs";
import { BaseRepository } from "../repository/baseRepository.mjs";
import { createDatabaseInstance } from "../repository/model/connection/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadLocalSettingsIntoEnv() {
  const settingsPath = path.join(__dirname, "..", "local.settings.json");
  if (!fs.existsSync(settingsPath)) {
    return;
  }

  const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  if (!settings || !settings.Values) {
    return;
  }

  Object.assign(process.env, settings.Values);
}

class DbTestRepository extends BaseRepository {
  constructor() {
    super({
      Question: "Question",
    });
  }
}

describe("db repository CRUD", () => {
  let sequelize;
  let repository;
  let createdQuestionId;
  const questionIdsToCleanup = new Set();
  const followUpCmdIdsToCleanup = new Set();
  const questionShareCmdIdsToCleanup = new Set();

  async function deleteQuestionAndLogs(questionId) {
    if (!questionId) return 0;

    await models.QuestionAction.destroy({ where: { questionId } });
    await models.QuestionLog.destroy({ where: { questionId } });
    return repository.Question.destroy({ where: { id: questionId } });
  }

  beforeAll(async () => {
    loadLocalSettingsIntoEnv();

    const config = {
      username: process.env.DB_USERNAME,
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
    };

    config.authMode = "password";
    if (process.env.DB_PASSWORD) {
      config.password = process.env.DB_PASSWORD;
    } else if (process.env.DB_HOST && process.env.DB_HOST.includes("postgres.database.azure.com")) {
      config.authMode = "azure-ad";
    }

    sequelize = await createDatabaseInstance(DB_TYPE.POSTGRES, config);
    await sequelize.authenticate();

    container.register("db", sequelize);
    container.register("models", models);

    repository = new DbTestRepository();
  });

  afterAll(async () => {
    if (repository && createdQuestionId) {
      await deleteQuestionAndLogs(createdQuestionId);
    }

    if (followUpCmdIdsToCleanup.size > 0) {
      const followUpIds = [...followUpCmdIdsToCleanup];
      await models.FollowUpEvent.destroy({ where: { followUpId: followUpIds } });
      await models.FollowUpCmd.destroy({ where: { id: followUpIds } });
    }

    if (questionShareCmdIdsToCleanup.size > 0) {
      const questionShareIds = [...questionShareCmdIdsToCleanup];
      await models.QuestionShareEvent.destroy({ where: { questionShareId: questionShareIds } });
      await models.QuestionShareCmd.destroy({ where: { id: questionShareIds } });
    }

    if (questionIdsToCleanup.size > 0) {
      for (const questionId of questionIdsToCleanup) {
        await deleteQuestionAndLogs(questionId);
      }
    }

    if (sequelize) {
      await sequelize.close();
    }
  });

  it("creates a question", async () => {
    const created = await repository.Question.create({
      profileId: uuidv4(),
      title: "vitest-db-create",
      questionText: "CRUD create from vitest",
      option: [{ id: "A", text: "one" }],
    });

    createdQuestionId = created.id;

    expect(created).toBeTruthy();
    expect(created.id).toBeTruthy();
    expect(created.questionText).toBe("CRUD create from vitest");
  });

  it("reads the created question", async () => {
    const found = await repository.Question.findByPk(createdQuestionId);

    expect(found).toBeTruthy();
    expect(found.id).toBe(createdQuestionId);
  });

  it("updates the created question", async () => {
    const found = await repository.Question.findByPk(createdQuestionId);

    await found.update({
      title: "vitest-db-updated",
      questionText: "CRUD update from vitest",
    });

    const updated = await repository.Question.findByPk(createdQuestionId);

    expect(updated.title).toBe("vitest-db-updated");
    expect(updated.questionText).toBe("CRUD update from vitest");
  });

  it("triggers QuestionAction afterSave hook", async () => {
    const profileId = uuidv4();
    const question = await repository.Question.create({
      profileId,
      title: "qa-hook-before",
      questionText: "before action hook",
      option: [{ id: "A", text: "one" }],
    });
    questionIdsToCleanup.add(question.id);

    await models.QuestionAction.create({
      profileId,
      questionId: question.id,
      action: [
        { op: "replace", path: "/title", value: "qa-hook-after" },
        { op: "replace", path: "/questionText", value: "after action hook" },
        { op: "replace", path: "/option", value: [{ id: "B", text: "two" }] },
      ],
    });

    const updated = await repository.Question.findByPk(question.id);

    expect(updated).toBeTruthy();
    expect(updated.title).toBe("qa-hook-after");
    expect(updated.questionText).toBe("after action hook");
    expect(updated.option).toEqual([{ id: "B", text: "two" }]);
  });

  it("triggers FollowUpCmd afterUpdate hook", async () => {
    const cmd = await models.FollowUpCmd.create({
      correlationId: uuidv4(),
      senderProfileId: uuidv4(),
      action: "create",
      data: { source: "vitest" },
      status: 0,
    });
    followUpCmdIdsToCleanup.add(cmd.id);

    cmd.previousStatus = cmd.status;
    await cmd.update({ status: 1 });

    const createdEvent = await models.FollowUpEvent.findOne({
      where: { followUpId: cmd.id, action: "create" },
      order: [["createdAt", "DESC"]],
    });

    expect(createdEvent).toBeTruthy();
    expect(createdEvent.followUpId).toBe(cmd.id);
    expect(createdEvent.senderProfileId).toBe(cmd.senderProfileId);
  });

  it("triggers QuestionShareCmd afterUpdate hook", async () => {
    const cmd = await models.QuestionShareCmd.create({
      correlationId: uuidv4(),
      senderProfileId: uuidv4(),
      action: "create",
      data: { source: "vitest" },
      status: 0,
    });
    questionShareCmdIdsToCleanup.add(cmd.id);

    cmd.previousStatus = cmd.status;
    await cmd.update({ status: 1 });

    const createdEvent = await models.QuestionShareEvent.findOne({
      where: { questionShareId: cmd.id, action: "create" },
      order: [["createdAt", "DESC"]],
    });

    expect(createdEvent).toBeTruthy();
    expect(createdEvent.questionShareId).toBe(cmd.id);
    expect(createdEvent.senderProfileId).toBe(cmd.senderProfileId);
  });

  it("deletes the created question", async () => {
    const deletedRows = await deleteQuestionAndLogs(createdQuestionId);
    const foundAfterDelete = await repository.Question.findByPk(createdQuestionId);

    expect(deletedRows).toBe(1);
    expect(foundAfterDelete).toBeNull();

    createdQuestionId = null;
  });
});

/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { v4 as uuidv4 } from "uuid";

import { initDbConnection } from "../sqlRepository/initDbConnection.mjs";
import sqlRepository from "../sqlRepository/repository.mjs";
import type { QuestRepository } from "../repository/contracts.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repository: QuestRepository = sqlRepository;

function loadLocalSettingsIntoEnv() {
  const settingsPath = path.join(__dirname, "..", "local.settings.json");
  if (!fs.existsSync(settingsPath)) return;

  const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  if (settings?.Values) Object.assign(process.env, settings.Values);
}

describe("SQL repository contract", () => {
  let sequelize;
  let models;
  let profileId;
  let questionId;

  beforeAll(async () => {
    loadLocalSettingsIntoEnv();
    ({ sequelize, models } = await initDbConnection());
  });

  afterAll(async () => {
    try {
      if (questionId) {
        await models.QuestionAction.destroy({ where: { questionId } });
        await models.QuestionLog.destroy({ where: { questionId } });
        await models.Question.destroy({ where: { id: questionId } });
      }
      if (profileId) {
        await models.Profile.destroy({ where: { internal_id: profileId } });
      }
    } finally {
      if (sequelize) await sequelize.close();
    }
  });

  it("creates and retrieves profiles and questions", async () => {
    const externalId = `vitest-${uuidv4()}`;
    const profile = await repository.createProfile(externalId);
    profileId = profile.id;

    expect(await repository.findProfileByExternalId(externalId)).toEqual(profile);

    const created = await repository.create(profile.id, "contract-test", "Created through the repository contract", ["one", "two"]);
    questionId = created.id;
    expect(created.id).toBeTruthy();

    const found = await repository.getById(created.id);
    expect(found).toMatchObject({
      id: created.id,
      profileId: profile.id,
      title: "contract-test",
      questionText: "Created through the repository contract",
      option: ["one", "two"],
    });

    const update = await repository.updateById(created.id, "updated", "Updated through the repository contract", ["three"]);
    expect(update).toEqual({ id: created.id });
    await expect(repository.getById(created.id)).resolves.toMatchObject({
      title: "updated",
      questionText: "Updated through the repository contract",
      option: ["three"],
    });
  });
});

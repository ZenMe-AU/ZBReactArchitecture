/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { v4 as uuidv4 } from "uuid";

import sqlRepository from "../repository/sql/repository.mjs";
import { initSqlRepository } from "./util/repositoriesInit.mjs";
import type { QuestRepository } from "../repository/contracts.mjs";

const repository: QuestRepository = sqlRepository;

describe("SQL repository contract", () => {
  let sequelize;
  let models;
  let profileId;
  let questionId;

  beforeAll(async () => {
    ({ sequelize, models } = await initSqlRepository());
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

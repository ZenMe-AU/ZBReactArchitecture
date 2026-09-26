/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Contract test for the Azure Table Storage repository layer, mirroring the
// CRUD/hook coverage in dbTest.test.mjs so the two stores can be compared
// endpoint by endpoint while both exist. Requires Azurite's table service
// (see package.json "test:table" script).

import { describe, it, expect, beforeAll } from "vitest";
import * as questionRepository from "../repository/table/questionRepository.mjs";
import * as answerRepository from "../repository/table/answerRepository.mjs";
import * as profileRepository from "../repository/table/profileRepository.mjs";
import { randomUUID } from "crypto";

describe("Azure Table question repository", () => {
  let questionId;
  let profileId;

  beforeAll(() => {
    profileId = randomUUID();
  });

  it("creates a question", async () => {
    const created = await questionRepository.createQuestion({
      profileId,
      title: "table-create",
      questionText: "CRUD create via Table Storage",
      option: [{ id: "A", text: "one" }],
    });

    questionId = created.id;
    expect(questionId).toBeTruthy();
  });

  it("reads the created question", async () => {
    const found = await questionRepository.getQuestionById(questionId);

    expect(found).toBeTruthy();
    expect(found.id).toBe(questionId);
    expect(found.questionText).toBe("CRUD create via Table Storage");
    expect(found.option).toEqual([{ id: "A", text: "one" }]);
    expect(found.profileId).toBe(profileId);
  });

  it("returns null for a question that does not exist", async () => {
    const found = await questionRepository.getQuestionById(randomUUID());
    expect(found).toBeNull();
  });

  it("updates the created question", async () => {
    await questionRepository.updateQuestionById(questionId, {
      title: "table-updated",
      questionText: "CRUD update via Table Storage",
      option: null,
    });

    const updated = await questionRepository.getQuestionById(questionId);

    expect(updated.title).toBe("table-updated");
    expect(updated.questionText).toBe("CRUD update via Table Storage");
    expect(updated.option).toBeNull();
  });

  it("applies a JSON Patch and records the action", async () => {
    const action = await questionRepository.patchQuestionById(questionId, profileId, [
      { op: "replace", path: "/title", value: "table-patched" },
      { op: "replace", path: "/option", value: [{ id: "B", text: "two" }] },
    ]);

    expect(action.id).toBeTruthy();

    const patched = await questionRepository.getQuestionById(questionId);
    expect(patched.title).toBe("table-patched");
    expect(patched.option).toEqual([{ id: "B", text: "two" }]);
  });

  it("rejects an update to a question that no longer exists", async () => {
    await expect(questionRepository.updateQuestionById(randomUUID(), { title: "x", questionText: "x", option: null })).rejects.toThrow(
      /not found/i
    );
  });
});

describe("Azure Table answer repository", () => {
  let questionId;

  beforeAll(async () => {
    const created = await questionRepository.createQuestion({
      profileId: randomUUID(),
      title: "answers",
      questionText: "Which city?",
      option: ["Taipei", "Taichung"],
    });
    questionId = created.id;
  });

  it("adds an answer and reads it back by id", async () => {
    const profileId = randomUUID();
    const added = await answerRepository.addAnswer({ questionId, profileId, answerText: null, optionId: "Taipei", duration: 120 });

    const found = await answerRepository.getAnswerById(questionId, added.id);
    expect(found).toBeTruthy();
    expect(found.profileId).toBe(profileId);
    expect(found.optionId).toBe("Taipei");
  });

  it("returns only the latest answer per profile, with a running count", async () => {
    const profileA = randomUUID();
    const profileB = randomUUID();

    await answerRepository.addAnswer({ questionId, profileId: profileA, answerText: null, optionId: "Taipei", duration: 100 });
    await new Promise((resolve) => setTimeout(resolve, 5));
    await answerRepository.addAnswer({ questionId, profileId: profileA, answerText: null, optionId: "Taichung", duration: 200 });
    await answerRepository.addAnswer({ questionId, profileId: profileB, answerText: null, optionId: "Taipei", duration: 150 });

    const list = await answerRepository.getAnswerListByQuestionId(questionId);
    const byProfile = Object.fromEntries(list.map((item) => [item.profileId, item]));

    expect(byProfile[profileA].optionId).toBe("Taichung"); // latest overwrites the first
    expect(byProfile[profileA].answerCount).toBe(2);
    expect(byProfile[profileB].optionId).toBe("Taipei");
    expect(byProfile[profileB].answerCount).toBe(1);
  });
});

describe("Azure Table profile repository", () => {
  it("creates a profile with a generated internal id when none exists", async () => {
    const externalId = randomUUID();
    const result = await profileRepository.ensureProfile(externalId);

    expect(result.created).toBe(true);
    expect(result.profile.internalId).toBeTruthy();
    expect(result.profile.externalId).toBe(externalId);
  });

  it("reuses the same internal id for a repeat external id", async () => {
    const externalId = randomUUID();
    const first = await profileRepository.ensureProfile(externalId);
    const second = await profileRepository.ensureProfile(externalId);

    expect(second.created).toBe(false);
    expect(second.profile.internalId).toBe(first.profile.internalId);
  });

  it("dedupes concurrent first calls for the same external id to one internal id", async () => {
    const externalId = randomUUID();
    const [a, b] = await Promise.all([profileRepository.ensureProfile(externalId), profileRepository.ensureProfile(externalId)]);

    expect(a.profile.internalId).toBe(b.profile.internalId);
    expect([a.created, b.created].filter(Boolean)).toHaveLength(1);
  });
});

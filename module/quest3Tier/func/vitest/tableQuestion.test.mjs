/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Contract test for the Azure Table Storage repository layer, mirroring the
// CRUD/hook coverage in dbTest.test.mjs so the two stores can be compared
// endpoint by endpoint while both exist. Requires Azurite's table service
// (see package.json "test:table" script).

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as questionRepository from "../repository/table/questionRepository.mjs";
import * as answerRepository from "../repository/table/answerRepository.mjs";
import * as profileRepository from "../repository/table/profileRepository.mjs";
import { getTableClient } from "../repository/table/tableClient.mjs";
import { randomUUID } from "crypto";

const newProfileId = async () => (await profileRepository.ensureProfile(randomUUID())).profile.internalId;

describe("Azure Table question repository", () => {
  let questionId;
  let profileId;
  let updateProfileId;

  beforeAll(async () => {
    profileId = await newProfileId();
    updateProfileId = await newProfileId();
  });

  it("rejects a question for a profile that does not exist", async () => {
    await expect(
      questionRepository.createQuestion({ profileId: randomUUID(), title: "orphan", questionText: "orphan", option: null })
    ).rejects.toThrow(/profile not found/i);
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
    const stored = await (await getTableClient("QuestionData")).getEntity(profileId, `question:${questionId}`);
    expect(stored.profileId).toBe(profileId);
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
    }, updateProfileId);

    const updated = await questionRepository.getQuestionById(questionId);

    expect(updated.title).toBe("table-updated");
    expect(updated.questionText).toBe("CRUD update via Table Storage");
    expect(updated.option).toBeNull();
    expect(updated.profileId).toBe(profileId);
  });

  it("applies a JSON Patch and returns the question id", async () => {
    const patchOps = [
      { op: "replace", path: "/title", value: "table-patched" },
      { op: "replace", path: "/option", value: [{ id: "B", text: "two" }] },
    ];
    const result = await questionRepository.patchQuestionById(questionId, profileId, patchOps);

    expect(result).toEqual({ id: questionId });

    const patched = await questionRepository.getQuestionById(questionId);
    expect(patched.title).toBe("table-patched");
    expect(patched.option).toEqual([{ id: "B", text: "two" }]);

    const questionRows = [];
    for await (const row of (await getTableClient("QuestionData")).listEntities({ queryOptions: { filter: `PartitionKey eq '${profileId}'` } })) {
      questionRows.push(row);
    }
    expect(questionRows.map(({ rowKey }) => rowKey)).toEqual([`question:${questionId}`]);
  });

  it("rejects an update to a question that no longer exists", async () => {
    await expect(questionRepository.updateQuestionById(randomUUID(), { title: "x", questionText: "x", option: null }, profileId)).rejects.toThrow(
      /not found/i
    );
  });
});

describe("Azure Table sharing repository", () => {
  it("shares a question and lists it for the receiver", async () => {
    const senderProfileId = await newProfileId();
    const receiverProfileId = await newProfileId();
    const question = await questionRepository.createQuestion({ profileId: senderProfileId, title: "shared", questionText: "share me", option: null });

    await questionRepository.shareQuestion(question.id, senderProfileId, [receiverProfileId]);

    expect((await questionRepository.getSharedQuestionListByProfileId(receiverProfileId)).map(({ id }) => id)).toEqual([question.id]);
    expect(await questionRepository.canAccessQuestion(question.id, senderProfileId)).toBe(true);
    expect(await questionRepository.canAccessQuestion(question.id, receiverProfileId)).toBe(true);
    expect(await questionRepository.canAccessQuestion(question.id, await newProfileId())).toBe(false);
    const client = await getTableClient("QuestionData");
    let storedShare;
    for await (const entity of client.listEntities()) {
      if (entity.rowKey.startsWith(`share:${question.id}:`)) storedShare = entity;
    }
    expect(storedShare.partitionKey).toBe(senderProfileId);
    expect(storedShare.type).toBe(0);
  });
});

describe("Azure Table answer repository", () => {
  let questionId;

  beforeAll(async () => {
    const created = await questionRepository.createQuestion({
      profileId: await newProfileId(),
      title: "answers",
      questionText: "Which city?",
      option: ["Taipei", "Taichung"],
    });
    questionId = created.id;
  });

  it("adds an answer and reads it back by id without Table Storage keys", async () => {
    const profileId = await newProfileId();
    const added = await answerRepository.addAnswer({ questionId, profileId, answerText: null, optionId: "Taipei", duration: 120 });

    const found = await answerRepository.getAnswerById(questionId, added.id);
    expect(found).toEqual({
      id: added.id,
      questionId,
      profileId,
      answerText: null,
      optionId: "Taipei",
      duration: 120,
      createdAt: expect.any(String),
    });
    const stored = await (await getTableClient("QuestionData")).getEntity(profileId, `answer:${questionId}:${added.id}`);
    expect(stored.profileId).toBe(profileId);
  });

  it("rejects an answer to a question that does not exist", async () => {
    const input = { questionId: randomUUID(), profileId: await newProfileId(), answerText: "x", optionId: null, duration: 1 };
    await expect(answerRepository.addAnswer(input)).rejects.toThrow(/question not found/i);
  });

  it("rejects an answer from a profile that does not exist", async () => {
    const input = { questionId, profileId: randomUUID(), answerText: "x", optionId: null, duration: 1 };
    await expect(answerRepository.addAnswer(input)).rejects.toThrow(/profile not found/i);
  });

  it("returns only the latest answer per profile, with a running count", async () => {
    const profileA = await newProfileId();
    const profileB = await newProfileId();

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
    expect(byProfile[profileB].answerText).toBeNull();
  });
});

describe("Azure Table profile repository", () => {
  it("creates a profile with a generated internal id when none exists", async () => {
    const externalId = randomUUID();
    const result = await profileRepository.ensureProfile(externalId);

    expect(result.created).toBe(true);
    expect(result.profile.internalId).toBeTruthy();
    expect(result.profile.externalId).toBe(externalId);
    expect(await profileRepository.getProfileByInternalId(result.profile.internalId)).toEqual(result.profile);

    const stored = await (await getTableClient(profileRepository.PROFILES_TABLE)).getEntity(result.profile.internalId, "profile");
    expect(stored.internal_id).toBe(result.profile.internalId);
    expect(stored.external_id).toBe(externalId);
    expect(stored.internalId).toBeUndefined();
    expect(stored.externalId).toBeUndefined();

    const storedIndex = await (await getTableClient(profileRepository.PROFILE_BY_EXTERNAL_ID_TABLE)).getEntity(externalId, "profile");
    expect(storedIndex.internal_id).toBe(result.profile.internalId);
    expect(storedIndex.external_id).toBe(externalId);
    expect(storedIndex.internalId).toBeUndefined();
    expect(storedIndex.externalId).toBeUndefined();
  });

  it("reuses the same internal id for a repeat external id", async () => {
    const externalId = randomUUID();
    const first = await profileRepository.ensureProfile(externalId);
    const second = await profileRepository.ensureProfile(externalId);

    expect(second.created).toBe(false);
    expect(second.profile).toEqual(first.profile);
  });

  it("dedupes concurrent first calls for the same external id to one internal id", async () => {
    const externalId = randomUUID();
    const [a, b] = await Promise.all([profileRepository.ensureProfile(externalId), profileRepository.ensureProfile(externalId)]);

    expect(a.profile.internalId).toBe(b.profile.internalId);
    expect([a.created, b.created].filter(Boolean)).toHaveLength(1);
    expect(await profileRepository.getProfileByInternalId(a.profile.internalId)).toEqual(a.profile);
  });

  it("repairs a missing Profiles row from the external-id index", async () => {
    const externalId = randomUUID();
    const internalId = randomUUID();
    const createdAt = new Date().toISOString();
    const index = await getTableClient(profileRepository.PROFILE_BY_EXTERNAL_ID_TABLE);
    await index.createEntity({ partitionKey: externalId, rowKey: "profile", internal_id: internalId, external_id: externalId, createdAt });

    const result = await profileRepository.ensureProfile(externalId);

    expect(result).toEqual({ profile: { internalId, externalId, createdAt }, created: false });
    expect(await profileRepository.getProfileByInternalId(internalId)).toEqual(result.profile);
  });

  it("reads camelCase profile entities created earlier on this branch", async () => {
    const externalId = randomUUID();
    const internalId = randomUUID();
    const createdAt = new Date().toISOString();
    const legacy = { internalId, externalId, createdAt };
    await (await getTableClient(profileRepository.PROFILE_BY_EXTERNAL_ID_TABLE)).createEntity({
      partitionKey: externalId,
      rowKey: "profile",
      ...legacy,
    });
    await (await getTableClient(profileRepository.PROFILES_TABLE)).createEntity({ partitionKey: internalId, rowKey: "profile", ...legacy });

    expect(await profileRepository.ensureProfile(externalId)).toEqual({ profile: legacy, created: false });
  });
});

describe("Azure Table profile share list", () => {
  const namedProfiles = [];
  const newNamedProfile = async (name, email) => {
    const { profile } = await profileRepository.ensureProfile(randomUUID(), { name, email });
    namedProfiles.push(profile);
    return profile;
  };
  const storedProfile = async (internalId) => (await getTableClient(profileRepository.PROFILES_TABLE)).getEntity(internalId, "profile");

  // Named profiles would otherwise show up in the local dev share list.
  afterAll(async () => {
    const profiles = await getTableClient(profileRepository.PROFILES_TABLE);
    const index = await getTableClient(profileRepository.PROFILE_BY_EXTERNAL_ID_TABLE);
    const disclosures = await getTableClient(profileRepository.PROFILE_DISCLOSURES_TABLE);
    for (const { internalId } of namedProfiles) {
      for await (const row of disclosures.listEntities({ queryOptions: { filter: `PartitionKey eq '${internalId}'` } })) {
        await disclosures.deleteEntity(row.partitionKey, row.rowKey);
      }
    }
    await Promise.all(
      namedProfiles.flatMap(({ internalId, externalId }) => [profiles.deleteEntity(internalId, "profile"), index.deleteEntity(externalId, "profile")])
    );
  });

  it("stores the name and email from the token and keeps them when a later call has none", async () => {
    const profile = await newNamedProfile("Table Test Receiver", "receiver@example.com");
    expect(await storedProfile(profile.internalId)).toMatchObject({ name: "Table Test Receiver", email: "receiver@example.com" });

    await profileRepository.ensureProfile(profile.externalId, { name: "Table Test Renamed" });
    expect(await storedProfile(profile.internalId)).toMatchObject({ name: "Table Test Renamed", email: "receiver@example.com" });

    await profileRepository.ensureProfile(profile.externalId);
    expect(await storedProfile(profile.internalId)).toMatchObject({ name: "Table Test Renamed", email: "receiver@example.com" });
  });

  it("keeps profiles anonymous until that person shares their name", async () => {
    const caller = await newNamedProfile("Table Test Caller");
    const target = await newNamedProfile("Table Test Target", "target@example.com");
    const unnamedId = await newProfileId();

    const anonymousList = await profileRepository.listProfiles(caller.internalId, 200, true);
    const anonymousTarget = anonymousList.find(({ id }) => id === target.internalId);

    expect(anonymousTarget).toMatchObject({ id: target.internalId, isNameShared: false });
    expect(anonymousTarget.name).toMatch(/^Person [0-9A-F]{4}$/);
    expect(anonymousTarget).not.toHaveProperty("email");
    expect(anonymousList.map(({ id }) => id)).not.toContain(caller.internalId);
    expect(anonymousList.map(({ id }) => id)).not.toContain(unnamedId);

    await profileRepository.shareName(target.internalId, caller.internalId);
    expect(await profileRepository.listProfiles(caller.internalId, 200, true)).toContainEqual({
      id: target.internalId,
      name: "Table Test Target",
      isNameShared: true,
    });
  });

  it("shares a question with a profile taken from the list", async () => {
    const sender = await newNamedProfile("Table Test Sender");
    const receiver = await newNamedProfile("Table Test Share Receiver");
    const question = await questionRepository.createQuestion({ profileId: sender.internalId, title: "share list", questionText: "share me", option: null });

    const listed = (await profileRepository.listProfiles(sender.internalId)).find(({ id }) => id === receiver.internalId);
    await questionRepository.shareQuestion(question.id, sender.internalId, [listed.id]);

    expect((await questionRepository.getSharedQuestionListByProfileId(receiver.internalId)).map(({ id }) => id)).toEqual([question.id]);
  });
});

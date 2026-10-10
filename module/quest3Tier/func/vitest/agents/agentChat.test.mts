/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { describe, expect, test } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { invalidAction, offlineActionReason, rules } from "./agentChat.config.mjs";
import { factMemory } from "./agentChat.memory.mjs";
import { runAgentChat } from "./agentChat.run.mjs";
import { HUMAN_NAME, HUMAN_OID, loadHuman, writeMemory } from "./agentChat.setup.mjs";
import * as authLocal from "../../service/authLocal.mjs";
import { belongsToExperiment } from "./agentChat.reset.mjs";

describe("agent option rules", () => {
  test("prioritises reusable factual questions", () => {
    const prompt = rules("Mike");
    expect(prompt).toContain("Maximise verified facts learned per question");
    expect(prompt).toContain("location, work field, household or family");
    expect(prompt).toContain("Re-use each strong question");
    expect(prompt).toContain("one fact dimension at a time");
    expect(prompt).toContain("online list is the complete set");
    expect(prompt).toContain("Never choose a vague option");
  });

  test("requires 4-10 short options on new questions", () => {
    expect(invalidAction("POST", "/question", { title: "Work", questionText: "Best work style?", option: ["Remote", "Office", "Hybrid", "Flexible"] })).toBeNull();
    expect(invalidAction("POST", "/question", { title: "Work", questionText: "Best work style?", option: ["Remote"] })).toBe("options:count");
  });

  test("accepts one short option and rejects long-text answers", () => {
    expect(invalidAction("POST", "/question/id/answer", { option: "Hybrid", duration: 3 })).toBeNull();
    expect(invalidAction("POST", "/question/id/answer", { answer: "I prefer hybrid work.", duration: 3 })).toBe("option:required");
    expect(invalidAction("POST", "/question/id/answer", { option: "Hybrid", answer: "Long explanation", duration: 3 })).toBe("option-only");
    expect(invalidAction("POST", "/question/id/answer", { option: "This is much too long", duration: 3 })).toBe("option:length:max-4-words-40-chars");
  });

  test("rejects vague group answers and accepts specific facts", () => {
    expect(invalidAction("POST", "/question/id/answer", { option: "Asia", duration: 3 })).toBe("option:too-vague:add-specific-option");
    expect(invalidAction("POST", "/question/id/answer", { option: "Other", duration: 3 })).toBe("option:too-vague:add-specific-option");
    expect(invalidAction("POST", "/question/id/answer", { option: "Creative or media", duration: 3 })).toBe("option:too-vague:add-specific-option");
    expect(invalidAction("POST", "/question/id/answer", { option: "Taipei", duration: 3 })).toBeNull();
    expect(invalidAction("POST", "/question/id/answer", { option: "UX design", duration: 3 })).toBeNull();
  });
});

describe("fact-only memory", () => {
  test("stores one memory file per subject", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "q3-memory-"));
    try {
      await writeMemory(directory, "Mike", { Bella: "### Facts\n- Marine biology", Ian: "### Facts\n- Civil engineering" });
      expect(await readFile(path.join(directory, "Bella.md"), "utf8")).toContain("Mike's memory of Bella");
      expect(await readFile(path.join(directory, "Ian.md"), "utf8")).toContain("Civil engineering");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  test("stores attributed answers and rejects anonymous answers", () => {
    const memory = factMemory("Bella", ["Mike", "Ian"], [
      {
        id: "q1",
        questionText: "Preferred work style?",
        answers: [
          { id: "a1", author: "Mike", optionId: "Hybrid" },
          { id: "a2", author: null, optionId: "Remote" },
        ],
      },
    ]);
    expect(memory.Mike).toContain("Preferred work style? — Hybrid");
    expect(memory.Mike).toContain("question: q1; answer: a1");
    expect(memory.Ian).toBe("### Facts\n- None verified.");
  });

  test("rejects facts without source ids", () => {
    const memory = factMemory("Bella", ["Mike"], [
      { id: "q1", questionText: "Preferred work style?", answers: [{ author: "Mike", optionId: "Hybrid" }] },
    ]);
    expect(memory.Mike).toBe("### Facts\n- None verified.");
  });
});

describe("online participant boundary", () => {
  test("rejects answers for offline owners and shares to offline profiles", () => {
    const questions = [{ id: "online", owner: "Bella", ownerOnline: true }, { id: "offline", owner: "Ian", ownerOnline: false }];
    const onlineIds = new Set(["bella-id", "mike-id"]);
    expect(offlineActionReason("/question/online/answer", {}, questions, onlineIds)).toBeNull();
    expect(offlineActionReason("/question/offline/answer", {}, questions, onlineIds)).toBe("question:owner-offline");
    expect(offlineActionReason("/question/online/share", { receiverIds: ["ian-id"] }, questions, onlineIds)).toBe("receiver:offline");
  });
});

describe("human participant", () => {
  test("uses a fixed local identity with an identity-blind token", () => {
    const human = loadHuman();
    const claims = authLocal.decode(human.token);
    expect(human.name).toBe(HUMAN_NAME);
    expect(claims).toMatchObject({ oid: HUMAN_OID, name: HUMAN_NAME, experiment: "human" });
  });

  test("attributes anonymous answers to the evaluator's real subject", () => {
    const memory = factMemory("Mike", ["Josh"], [
      {
        id: "q-human",
        questionText: "Where do you live?",
        answers: [{ id: "a-human", author: "Person 7A2C", memoryAuthor: "Josh", optionId: "Brisbane" }],
      },
    ]);
    expect(memory.Josh).toContain("Where do you live? — Brisbane");
  });

  test("selects only records connected to current participants", () => {
    const profiles = new Set(["josh", "bella"]);
    const questions = new Set(["q-current"]);
    expect(belongsToExperiment({ profileId: "bella", id: "q-current" }, profiles, questions)).toBe(true);
    expect(belongsToExperiment({ profileId: "other", questionId: "q-current" }, profiles, questions)).toBe(true);
    expect(belongsToExperiment({ senderProfileId: "other", receiverProfileId: "josh" }, profiles, questions)).toBe(true);
    expect(belongsToExperiment({ profileId: "other", questionId: "q-old" }, profiles, questions)).toBe(false);
  });
});

describe.skipIf(!process.env.AGENT_RUN)("agent chat run", () => {
  test("agents get to know each other through Q3", runAgentChat, 60 * 60 * 1000);
});

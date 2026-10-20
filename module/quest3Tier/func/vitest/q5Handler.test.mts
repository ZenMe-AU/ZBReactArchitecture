/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from "vitest";

const repository = vi.hoisted(() => ({
  getById: vi.fn(async () => ({ id: "question", profileId: "me", option: ["A"], optionList: ["A"] })),
  getCombinationListByUser: vi.fn(async () => [
    { id: "mine", profileId: "me" },
    { id: "shared", profileId: "other" },
  ]),
  getAnswerListByQuestionId: vi.fn(async () => [
    { id: "a1", profileId: "me", optionAnswerList: ["A"] },
    { id: "a2", profileId: "other", optionAnswerList: ["A"] },
  ]),
  patchById: vi.fn(async () => ({ id: "question" })),
  insertFollowUpCmd: vi.fn(async () => ({ id: "command" })),
  insertFollowUpFilter: vi.fn(async () => []),
  shareQuestion: vi.fn(async () => []),
  updateFollowUpCmdStatus: vi.fn(async () => ({})),
}));

vi.mock("../repository/getRepository.mjs", () => ({ getRepository: () => repository }));
import q5Handler, { sendFollowUpBody } from "../handler/q5Handler.mjs";

const userData = { profileId: "me", externalId: "oid" };
const uuid = "6f1c2a4e-0000-4000-8000-000000000001";

describe("Q5 UI routes", () => {
  it("returns the caller's own profileId as the Entra oid", async () => {
    const question = await q5Handler.getQuestion({ params: { id: "question" }, userData }, {});
    expect(question.return.detail.profileId).toBe("oid");

    const questions = await q5Handler.getQuestions({ userData }, {});
    expect(questions.return.list.map((q) => q.profileId)).toEqual(["oid", "other"]);

    const answers = await q5Handler.getAnswers({ params: { id: "question" }, userData }, {});
    expect(answers.return.list.map((a) => a.profileId)).toEqual(["oid", null]);
  });

  it("saves /optionList patches as option", async () => {
    await q5Handler.updateQuestion(
      { params: { id: "question" }, userData, clientParams: [{ op: "replace", path: "/optionList/0", value: "B" }, { op: "replace", path: "/title", value: "T" }] },
      {}
    );
    expect(repository.patchById).toHaveBeenCalledWith(
      "question",
      [{ op: "replace", path: "/option/0", value: "B" }, { op: "replace", path: "/title", value: "T" }],
      "me"
    );
  });

  it("sends one follow-up per question in questionIdList", async () => {
    const clientParams = { questionIdList: [uuid, uuid.replace(/1$/, "2")], question: [{ questionId: uuid, option: ["A"] }], isSave: true };
    expect(sendFollowUpBody.safeParse(clientParams).success).toBe(true);
    expect(sendFollowUpBody.safeParse({ ...clientParams, newQuestionId: uuid }).success).toBe(false);

    await q5Handler.sendFollowUp({ correlationId: "correlation", userData, clientParams }, {});
    expect(repository.shareQuestion).toHaveBeenCalledTimes(2);
    for (const questionId of clientParams.questionIdList) expect(repository.shareQuestion).toHaveBeenCalledWith(questionId, "me", expect.anything());
  });
});

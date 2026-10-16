/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import "./swagger/openapi.mjs";
import { app } from "@azure/functions";
import { requestHandler } from "./handler/handlerWrapper.mjs";
import questionHandler from "./handler/questionHandler.mjs";
import answerHandler from "./handler/answerHandler.mjs";
import followupHandler from "./handler/followupHandler.mjs";
import * as CreateQuestion from "./handler/CreateQuestion.mjs";
import * as GetQuestionById from "./handler/GetQuestionById.mjs";
import * as UpdateQuestionById from "./handler/UpdateQuestionById.mjs";
import * as PatchQuestionById from "./handler/PatchQuestionById.mjs";
import * as AddAnswer from "./handler/AddAnswer.mjs";
import * as GetAnswerById from "./handler/GetAnswerById.mjs";
import * as GetQuestionListByUser from "./handler/GetQuestionListByUser.mjs";
import * as GetAnswerListByQuestionId from "./handler/GetAnswerListByQuestionId.mjs";
import * as ShareQuestion from "./handler/ShareQuestion.mjs";
import * as GetSharedQuestionList from "./handler/GetSharedQuestionList.mjs";
import * as SendFollowUpCmd from "./handler/SendFollowUpCmd.mjs";
import * as ShareQuestionCmd from "./handler/ShareQuestionCmd.mjs";
import * as getEventByCorrelationId from "./handler/getEventByCorrelationId.mjs";

//TODO: Review schema usage and ensure all endpoints have a correct schema assigned which is also in sync with the relevant function and relevant swagger doc.

app.openAPIPath("CreateQuestion", "Create a question", {
  route: "question",
  methods: ["POST"],
  authLevel: "anonymous",
  tags: ["Question"],
  body: CreateQuestion.body,
  responses: CreateQuestion.responses,
  handler: requestHandler(questionHandler.CreateQuestion, {
    schemas: [CreateQuestion.body],
  }),
});

app.openAPIPath("GetQuestionById", "Get a question by ID", {
  route: "question/{id}",
  methods: ["GET"],
  authLevel: "anonymous",
  tags: ["Question"],
  params: GetQuestionById.params,
  responses: GetQuestionById.responses,
  handler: requestHandler(questionHandler.GetQuestionById, {
    params: GetQuestionById.params,
  }),
});

app.openAPIPath("UpdateQuestionById", "Update a question", {
  route: "question/{id}",
  methods: ["PUT"],
  authLevel: "anonymous",
  tags: ["Question"],
  params: UpdateQuestionById.params,
  body: UpdateQuestionById.body,
  responses: UpdateQuestionById.responses,
  handler: requestHandler(questionHandler.UpdateQuestionById, {
    params: UpdateQuestionById.params,
    schemas: [UpdateQuestionById.body],
  }),
});

app.openAPIPath("PatchQuestionById", "Update a question using JSON Patch", {
  route: "question/{id}",
  methods: ["PATCH"],
  authLevel: "anonymous",
  tags: ["Question"],
  request: {
    params: PatchQuestionById.params,
    body: { content: { "application/json-patch+json": { schema: PatchQuestionById.body } } },
  },
  responses: PatchQuestionById.responses,
  handler: requestHandler(questionHandler.PatchQuestionById, {
    params: PatchQuestionById.params,
    schemas: [PatchQuestionById.body],
  }),
});

app.openAPIPath("AddAnswer", "Answer a question", {
  route: "question/{id}/answer",
  methods: ["POST"],
  authLevel: "anonymous",
  tags: ["Answer"],
  params: AddAnswer.params,
  body: AddAnswer.body,
  responses: AddAnswer.responses,
  handler: requestHandler(answerHandler.AddAnswer, {
    params: AddAnswer.params,
    schemas: [AddAnswer.body],
  }),
});

app.openAPIPath("GetAnswerById", "Get an answer by ID", {
  route: "question/{id}/answer/{answerId}",
  methods: ["GET"],
  authLevel: "anonymous",
  tags: ["Answer"],
  params: GetAnswerById.params,
  responses: GetAnswerById.responses,
  handler: requestHandler(answerHandler.GetAnswerById, {
    params: GetAnswerById.params,
  }),
});

app.openAPIPath("GetQuestionListByUser", "List questions created by or shared with the caller", {
  route: "questions",
  methods: ["GET"],
  authLevel: "anonymous",
  tags: ["Question"],
  responses: GetQuestionListByUser.responses,
  handler: requestHandler(questionHandler.GetQuestionListByUser),
});

app.openAPIPath("GetAnswerListByQuestionId", "List answers to a question", {
  route: "question/{id}/answers",
  methods: ["GET"],
  authLevel: "anonymous",
  tags: ["Answer"],
  params: GetAnswerListByQuestionId.params,
  responses: GetAnswerListByQuestionId.responses,
  handler: requestHandler(answerHandler.GetAnswerListByQuestionId, {
    params: GetAnswerListByQuestionId.params,
  }),
});

app.openAPIPath("ShareQuestion", "Share a question", {
  route: "question/{id}/share",
  methods: ["POST"],
  authLevel: "anonymous",
  tags: ["Share"],
  params: ShareQuestion.params,
  body: ShareQuestion.body,
  responses: ShareQuestion.responses,
  handler: requestHandler(followupHandler.ShareQuestionById, {
    params: ShareQuestion.params,
    schemas: [ShareQuestion.body],
  }),
});

app.openAPIPath("GetSharedQuestionList", "List questions shared with the caller", {
  route: "sharedQuestions",
  methods: ["GET"],
  authLevel: "anonymous",
  tags: ["Share"],
  responses: GetSharedQuestionList.responses,
  handler: requestHandler(followupHandler.GetSharedQuestionListByUser),
});

app.openAPIPath("SendFollowUpCmd", "Send a follow-up question to matching respondents", {
  route: "sendFollowUpCmd",
  methods: ["POST"],
  authLevel: "anonymous",
  tags: ["Command"],
  headers: SendFollowUpCmd.headers,
  body: SendFollowUpCmd.body,
  responses: SendFollowUpCmd.responses,
  handler: requestHandler(followupHandler.SendFollowUpCmd, {
    schemas: [SendFollowUpCmd.body],
  }),
});

app.openAPIPath("ShareQuestionCmd", "Share a question with profiles", {
  route: "shareQuestionCmd",
  methods: ["POST"],
  authLevel: "anonymous",
  tags: ["Command"],
  headers: ShareQuestionCmd.headers,
  body: ShareQuestionCmd.body,
  responses: ShareQuestionCmd.responses,
  handler: requestHandler(followupHandler.ShareQuestionCmd, {
    schemas: [ShareQuestionCmd.body],
  }),
});

app.openAPIPath("getEventByCorrelationId", "Count events recorded for a command", {
  route: "getEventByCorrelationId/{name}/{correlationId}",
  methods: ["GET"],
  authLevel: "anonymous",
  tags: ["Command"],
  params: getEventByCorrelationId.params,
  responses: getEventByCorrelationId.responses,
  handler: requestHandler(followupHandler.GetEventByCorrelationId, {
    params: getEventByCorrelationId.params,
  }),
});

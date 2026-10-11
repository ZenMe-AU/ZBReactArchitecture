/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { app } from "@azure/functions";
import { requestHandler } from "./handler/handlerWrapper.mjs";
import { CreateQuestion } from "./handler/question/create.mjs";
import { GetQuestionById } from "./handler/question/getById.mjs";
import { GetQuestionListByUser } from "./handler/question/getListByUser.mjs";
import { PatchQuestionById } from "./handler/question/patchById.mjs";
import { UpdateQuestionById } from "./handler/question/updateById.mjs";
import answerHandler from "./handler/answerHandler.mjs";
import followupHandler from "./handler/followupHandler.mjs";
import { sendFollowUpCmdSchema } from "./schema/sendFollowUpCmdSchema.mjs";
import { shareQuestionCmdSchema } from "./schema/shareQuestionCmdSchema.mjs";

//TODO: Review schema usage and ensure all endpoints have a correct schema assigned which is also in sync with the relevant function and relevant swagger doc.

app.http("CreateQuestion", {
  route: "question",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: requestHandler(CreateQuestion),
});

app.http("GetQuestionById", {
  route: "question/{id}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(GetQuestionById),
});

app.http("UpdateQuestionById", {
  route: "question/{id}",
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: requestHandler(UpdateQuestionById),
});

app.http("PatchQuestionById", {
  route: "question/{id}",
  methods: ["PATCH"],
  authLevel: "anonymous",
  handler: requestHandler(PatchQuestionById),
});

app.http("AddAnswer", {
  route: "question/{id}/answer",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: requestHandler(answerHandler.AddAnswer),
});

app.http("GetAnswerById", {
  route: "question/{id:int}/answer/{answerId:int}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(answerHandler.GetAnswerById),
});

app.http("GetQuestionListByUser", {
  route: "questions",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(GetQuestionListByUser),
});

app.http("GetAnswerListByQuestionId", {
  route: "question/{id}/answers",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(answerHandler.GetAnswerListByQuestionId),
});

app.http("ShareQuestion", {
  route: "question/{id}/share",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: requestHandler(followupHandler.ShareQuestionById),
});

app.http("GetSharedQuestionList", {
  route: "sharedQuestions",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(followupHandler.GetSharedQuestionListByUser),
});

app.http("SendFollowUpCmd", {
  route: "sendFollowUpCmd",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: requestHandler(followupHandler.SendFollowUpCmd, {
    schemas: [sendFollowUpCmdSchema],
  }),
});

app.http("ShareQuestionCmd", {
  route: "shareQuestionCmd",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: requestHandler(followupHandler.ShareQuestionCmd, {
    schemas: [shareQuestionCmdSchema],
  }),
});

app.http("getEventByCorrelationId", {
  route: "getEventByCorrelationId/{name}/{correlationId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(followupHandler.GetEventByCorrelationId),
});

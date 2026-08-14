/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { app } from "@azure/functions";
import { requestHandler } from "./handler/handlerWrapper.mjs";
import questionHandler from "./handler/questionHandler.mjs";
import answerHandler from "./handler/answerHandler.mjs";
import followupHandler from "./handler/followupHandler.mjs";
import { sendFollowUpCmdSchema } from "./schema/sendFollowUpCmdSchema.mjs";
import { shareQuestionCmdSchema } from "./schema/shareQuestionCmdSchema.mjs";

app.http("CreateQuestion", {
  route: "question",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: requestHandler(questionHandler.CreateQuestion),
});

app.http("GetQuestionById", {
  route: "question/{id}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(questionHandler.GetQuestionById),
});

app.http("UpdateQuestionById", {
  route: "question/{id}",
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: requestHandler(questionHandler.UpdateQuestionById),
});

app.http("PatchQuestionById", {
  route: "question/{id}",
  methods: ["PATCH"],
  authLevel: "anonymous",
  handler: requestHandler(questionHandler.PatchQuestionById),
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
  route: "profile/{profileId}/question",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(questionHandler.GetQuestionListByUser),
});

app.http("GetAnswerListByQuestionId", {
  route: "question/{id}/answer",
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

app.http("GetSharedQuestionListByUser", {
  route: "profile/{profileId}/sharedQuestion",
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

/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { app } from "@azure/functions";
import { requestHandler } from "./handler/handlerWrapper.mjs";
import questionHandler from "./handler/handler.mjs";
import { sendFollowUpCmdSchema } from "./schema/sendFollowUpCmdSchema.mjs";
import { shareQuestionCmdSchema } from "./schema/shareQuestionCmdSchema.mjs";
// const { followUpCmdQueue, shareQuestionCmdQueue } = require("./service/serviceBus.js");

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
  handler: requestHandler(questionHandler.AddAnswer),
});

app.http("GetAnswerById", {
  route: "question/{id:int}/answer/{answerId:int}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(questionHandler.GetAnswerById),
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
  handler: requestHandler(questionHandler.GetAnswerListByQuestionId),
});

app.http("ShareQuestion", {
  route: "question/{id}/share",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: requestHandler(questionHandler.ShareQuestionById),
});

app.http("GetSharedQuestionListByUser", {
  route: "profile/{profileId}/sharedQuestion",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(questionHandler.GetSharedQuestionListByUser),
});

app.http("SendFollowUpCmd", {
  route: "sendFollowUpCmd",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: requestHandler(questionHandler.SendFollowUpCmd, {
    schemas: [sendFollowUpCmdSchema],
  }),
});

app.http("ShareQuestionCmd", {
  route: "shareQuestionCmd",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: requestHandler(questionHandler.ShareQuestionCmd, {
    schemas: [shareQuestionCmdSchema],
  }),
});

app.http("getEventByCorrelationId", {
  route: "getEventByCorrelationId/{name}/{correlationId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(questionHandler.GetEventByCorrelationId),
});

// app.serviceBusQueue("sendFollowUpCmdQueue", {
//   connection: "ServiceBusConnection",
//   queueName: "followupcmd",
//   handler: serviceBusHandler(questionHandler.SendFollowUpCmd),
// });

// app.serviceBusQueue("shareQuestionCmdQueue", {
//   connection: "ServiceBusConnection",
//   queueName: "ShareQuestionCmd",
//   handler: serviceBusHandler(questionHandler.ShareQuestionCmd),
// });

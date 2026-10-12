/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import "./swagger/openapi.mjs";
import { app } from "@azure/functions";
import { z } from "zod";
import { requestHandler } from "./handler/handlerWrapper.mjs";
import questionHandler from "./handler/questionHandler.mjs";
import answerHandler from "./handler/answerHandler.mjs";
import followupHandler from "./handler/followupHandler.mjs";
import { errorResponseSchema, successResponse } from "./schema/commonSchema.mjs";
import { sendFollowUpCmdSchema } from "./schema/sendFollowUpCmdSchema.mjs";
import { shareQuestionCmdSchema } from "./schema/shareQuestionCmdSchema.mjs";
import {
  answerBodySchema,
  answerIdParams,
  answerListItemSchema,
  answerRecordSchema,
  eventParams,
  questionBodySchema,
  questionIdParams,
  questionPatchSchema,
  questionRecordSchema,
  shareQuestionBodySchema,
} from "./schema/questionSchema.mjs";

//TODO: Review schema usage and ensure all endpoints have a correct schema assigned which is also in sync with the relevant function and relevant swagger doc.

const errors = [401, 500].map((httpCode) => ({ httpCode, schema: errorResponseSchema }));
const bodyErrors = [{ httpCode: 400, schema: errorResponseSchema }, ...errors];
const idResponse = successResponse(z.object({ id: z.uuid() }));
const trueResponse = successResponse(z.literal(true));
const correlationHeader = z.object({
  "X-Correlation-Id": z.string().optional().meta({ description: "Look up the command result with GET /getEventByCorrelationId" }),
});

app.openAPIPath("CreateQuestion", "Create a question", {
  route: "question",
  methods: ["POST"],
  authLevel: "anonymous",
  tags: ["Question"],
  body: questionBodySchema,
  responses: [{ httpCode: 200, schema: idResponse }, ...bodyErrors],
  handler: requestHandler(questionHandler.CreateQuestion),
});

app.openAPIPath("GetQuestionById", "Get a question by ID", {
  route: "question/{id}",
  methods: ["GET"],
  authLevel: "anonymous",
  tags: ["Question"],
  params: questionIdParams,
  responses: [{ httpCode: 200, schema: successResponse(z.object({ detail: questionRecordSchema.nullable() })) }, ...errors],
  handler: requestHandler(questionHandler.GetQuestionById),
});

app.openAPIPath("UpdateQuestionById", "Update a question", {
  route: "question/{id}",
  methods: ["PUT"],
  authLevel: "anonymous",
  tags: ["Question"],
  params: questionIdParams,
  body: questionBodySchema,
  responses: [{ httpCode: 200, schema: idResponse }, ...bodyErrors],
  handler: requestHandler(questionHandler.UpdateQuestionById),
});

app.openAPIPath("PatchQuestionById", "Update a question using JSON Patch", {
  route: "question/{id}",
  methods: ["PATCH"],
  authLevel: "anonymous",
  tags: ["Question"],
  request: {
    params: questionIdParams,
    body: { content: { "application/json-patch+json": { schema: questionPatchSchema } } },
  },
  responses: [{ httpCode: 200, schema: idResponse }, ...bodyErrors],
  handler: requestHandler(questionHandler.PatchQuestionById),
});

app.openAPIPath("AddAnswer", "Answer a question", {
  route: "question/{id}/answer",
  methods: ["POST"],
  authLevel: "anonymous",
  tags: ["Answer"],
  params: questionIdParams,
  body: answerBodySchema,
  responses: [{ httpCode: 200, schema: idResponse }, ...bodyErrors],
  handler: requestHandler(answerHandler.AddAnswer),
});

app.openAPIPath("GetAnswerById", "Get an answer by ID", {
  route: "question/{id}/answer/{answerId}",
  methods: ["GET"],
  authLevel: "anonymous",
  tags: ["Answer"],
  params: answerIdParams,
  responses: [{ httpCode: 200, schema: successResponse(z.object({ detail: answerRecordSchema.nullable() })) }, ...errors],
  handler: requestHandler(answerHandler.GetAnswerById),
});

app.openAPIPath("GetQuestionListByUser", "List questions created by or shared with the caller", {
  route: "questions",
  methods: ["GET"],
  authLevel: "anonymous",
  tags: ["Question"],
  responses: [{ httpCode: 200, schema: successResponse(z.object({ list: z.array(questionRecordSchema) })) }, ...errors],
  handler: requestHandler(questionHandler.GetQuestionListByUser),
});

app.openAPIPath("GetAnswerListByQuestionId", "List answers to a question", {
  route: "question/{id}/answers",
  methods: ["GET"],
  authLevel: "anonymous",
  tags: ["Answer"],
  params: questionIdParams,
  responses: [{ httpCode: 200, schema: successResponse(z.object({ list: z.array(answerListItemSchema) })) }, ...errors],
  handler: requestHandler(answerHandler.GetAnswerListByQuestionId),
});

app.openAPIPath("ShareQuestion", "Share a question", {
  route: "question/{id}/share",
  methods: ["POST"],
  authLevel: "anonymous",
  tags: ["Share"],
  params: questionIdParams,
  body: shareQuestionBodySchema,
  responses: [{ httpCode: 200, schema: trueResponse }, ...bodyErrors],
  handler: requestHandler(followupHandler.ShareQuestionById),
});

app.openAPIPath("GetSharedQuestionList", "List questions shared with the caller", {
  route: "sharedQuestions",
  methods: ["GET"],
  authLevel: "anonymous",
  tags: ["Share"],
  responses: [{ httpCode: 200, schema: successResponse(z.object({ list: z.array(questionRecordSchema) })) }, ...errors],
  handler: requestHandler(followupHandler.GetSharedQuestionListByUser),
});

app.openAPIPath("SendFollowUpCmd", "Send a follow-up question to matching respondents", {
  route: "sendFollowUpCmd",
  methods: ["POST"],
  authLevel: "anonymous",
  tags: ["Command"],
  headers: correlationHeader,
  body: sendFollowUpCmdSchema,
  responses: [{ httpCode: 200, schema: trueResponse }, ...bodyErrors],
  handler: requestHandler(followupHandler.SendFollowUpCmd, {
    schemas: [sendFollowUpCmdSchema],
  }),
});

app.openAPIPath("ShareQuestionCmd", "Share a question with profiles", {
  route: "shareQuestionCmd",
  methods: ["POST"],
  authLevel: "anonymous",
  tags: ["Command"],
  headers: correlationHeader,
  body: shareQuestionCmdSchema,
  responses: [{ httpCode: 200, schema: trueResponse }, ...bodyErrors],
  handler: requestHandler(followupHandler.ShareQuestionCmd, {
    schemas: [shareQuestionCmdSchema],
  }),
});

app.openAPIPath("getEventByCorrelationId", "Count events recorded for a command", {
  route: "getEventByCorrelationId/{name}/{correlationId}",
  methods: ["GET"],
  authLevel: "anonymous",
  tags: ["Command"],
  params: eventParams,
  responses: [{ httpCode: 200, schema: successResponse(z.object({ qty: z.int() })) }, ...errors],
  handler: requestHandler(followupHandler.GetEventByCorrelationId),
});

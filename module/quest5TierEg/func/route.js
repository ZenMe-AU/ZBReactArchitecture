const { app } = require("@azure/functions");
const { requestHandler, serviceBusHandler, eventGridHandler } = require("./handler/handlerWrapper.js");
const apiCmdHandler = require("./handler/apiCmdHandler.js");
const apiQryHandler = require("./handler/apiQryHandler.js");
const queueCmdHandler = require("./handler/queueCmdHandler.js");
const sendFollowUpCmdSchema = require("./schema/sendFollowUpCmdSchema");
const shareQuestionCmdSchema = require("./schema/shareQuestionCmdSchema");
const { eventGridDomain } = require("./eventGrid/output.js");

app.http("GetQuestion", {
  route: "questionQry/getQuestion/{questionId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(apiQryHandler.GetQuestionById),
});

app.http("GetAnswer", {
  route: "questionQry/getAnswer/{answerId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(apiQryHandler.GetAnswerById),
});

app.http("GetQuestionList", {
  route: "questionQry/getQuestions/{profileId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(apiQryHandler.GetQuestionListByUser),
});

app.http("GetAnswerList", {
  route: "questionQry/getAnswers/{questionId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(apiQryHandler.GetAnswerListByQuestionId),
});

app.http("GetSharedQuestionList", {
  route: "questionQry/getSharedQuestions/{profileId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(apiQryHandler.GetSharedQuestionListByUser),
});

app.http("GetQuestionShareEventList", {
  route: "questionQry/getQuestionShareEvents/{correlationId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(apiQryHandler.GetEventByCorrelationId, {
    customParams: { tableName: "QuestionShareEvent" },
  }),
});

app.http("GetFollowUpEventList", {
  route: "questionQry/getFollowUpEvents/{correlationId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(apiQryHandler.GetEventByCorrelationId, {
    customParams: { tableName: "followUp" },
  }),
});

app.http("CreateQuestion", {
  route: "questionCmd/createQuestion",
  methods: ["POST"],
  extraOutputs: [eventGridDomain],
  authLevel: "anonymous",
  handler: requestHandler(apiCmdHandler.CreateQuestion),
});

app.http("UpdateQuestion", {
  route: "questionCmd/updateQuestion/{questionId}",
  methods: ["POST"],
  // extraOutputs: [updateQuestion],
  authLevel: "anonymous",
  handler: requestHandler(apiCmdHandler.UpdateQuestion),
});

app.http("CreateAnswer", {
  route: "questionCmd/createAnswer/{questionId}",
  methods: ["POST"],
  // extraOutputs: [createAnswer],
  authLevel: "anonymous",
  handler: requestHandler(apiCmdHandler.CreateAnswer),
});

app.http("SendFollowUp", {
  route: "questionCmd/sendFollowUp",
  methods: ["POST"],
  // extraOutputs: [sendFollowUp],
  authLevel: "anonymous",
  handler: requestHandler(apiCmdHandler.SendFollowUp, {
    schemas: [sendFollowUpCmdSchema],
  }),
});

app.http("ShareQuestion", {
  route: "questionCmd/shareQuestion",
  methods: ["POST"],
  // extraOutputs: [shareQuestion],
  authLevel: "anonymous",
  handler: requestHandler(apiCmdHandler.ShareQuestion, {
    schemas: [shareQuestionCmdSchema],
  }),
});

app.eventGrid("SendFollowUpQueue", {
  handler: eventGridHandler(queueCmdHandler.SendFollowUp),
});

app.eventGrid("ShareQuestionQueue", {
  handler: eventGridHandler(queueCmdHandler.ShareQuestion),
});

app.eventGrid("CreateQuestionQueue", {
  handler: eventGridHandler(queueCmdHandler.CreateQuestion),
});

app.eventGrid("UpdateQuestionQueue", {
  handler: eventGridHandler(queueCmdHandler.UpdateQuestion),
});

app.eventGrid("CreateAnswerQueue", {
  handler: eventGridHandler(queueCmdHandler.CreateAnswer),
});

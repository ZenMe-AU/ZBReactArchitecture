require("@zenmechat/shared");
const { app } = require("@azure/functions");
const { requestHandler, serviceBusHandler } = require("@zenmechat/shared/handler");
const cmdHandler = require("./handler/apiCmdHandler.js");
const qryHandler = require("./handler/apiQryHandler.js");
const queueHandler = require("./handler/queueCmdHandler.js");
const sendFollowUpCmdSchema = require("./schema/sendFollowUpCmdSchema");
const shareQuestionCmdSchema = require("./schema/shareQuestionCmdSchema");
const { sendFollowUp, shareQuestion, createQuestion, updateQuestion, createAnswer } = require("./service/serviceBus");

app.http("GetQuestion", {
  route: "questionQry/getQuestion/{questionId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(qryHandler.GetQuestionById),
});

app.http("GetAnswer", {
  route: "questionQry/getAnswer/{answerId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(qryHandler.GetAnswerById),
});

app.http("GetQuestionList", {
  route: "questionQry/getQuestions/{profileId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(qryHandler.GetQuestionListByUser),
});

app.http("GetAnswerList", {
  route: "questionQry/getAnswers/{questionId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(qryHandler.GetAnswerListByQuestionId),
});

app.http("GetSharedQuestionList", {
  route: "questionQry/getSharedQuestions/{profileId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(qryHandler.GetSharedQuestionListByUser),
});

app.http("getQuestionShareEventList", {
  route: "questionQry/getQuestionShareEvents/{correlationId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(qryHandler.GetEventByCorrelationId, {
    customParams: { tableName: "QuestionShareEvent" },
  }),
});

app.http("getFollowUpEventList", {
  route: "questionQry/getFollowUpEvents/{correlationId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(qryHandler.GetEventByCorrelationId, {
    customParams: { tableName: "followUpEvent" },
  }),
});

app.http("CreateQuestion", {
  route: "questionCmd/createQuestion",
  methods: ["POST"],
  extraOutputs: [createQuestion],
  authLevel: "anonymous",
  handler: requestHandler(cmdHandler.CreateQuestion),
});

app.http("UpdateQuestion", {
  route: "questionCmd/updateQuestion/{questionId}",
  methods: ["POST"],
  extraOutputs: [updateQuestion],
  authLevel: "anonymous",
  handler: requestHandler(cmdHandler.UpdateQuestion),
});

app.http("CreateAnswer", {
  route: "questionCmd/createAnswer/{questionId}",
  methods: ["POST"],
  extraOutputs: [createAnswer],
  authLevel: "anonymous",
  handler: requestHandler(cmdHandler.CreateAnswer),
});

app.http("SendFollowUp", {
  route: "questionCmd/sendFollowUp",
  methods: ["POST"],
  extraOutputs: [sendFollowUp],
  authLevel: "anonymous",
  handler: requestHandler(cmdHandler.SendFollowUp, {
    schemas: [sendFollowUpCmdSchema],
  }),
});

app.http("ShareQuestion", {
  route: "questionCmd/shareQuestion",
  methods: ["POST"],
  extraOutputs: [shareQuestion],
  authLevel: "anonymous",
  handler: requestHandler(cmdHandler.ShareQuestion, {
    schemas: [shareQuestionCmdSchema],
  }),
});

app.serviceBusQueue("sendFollowUpQueue", {
  connection: "Zmchat_SERVICEBUS",
  queueName: "sendFollowUp",
  handler: serviceBusHandler(queueHandler.SendFollowUp),
});

app.serviceBusQueue("shareQuestionQueue", {
  connection: "Zmchat_SERVICEBUS",
  queueName: "shareQuestion",
  handler: serviceBusHandler(queueHandler.ShareQuestion),
});

app.serviceBusQueue("CreateQuestionQueue", {
  connection: "Zmchat_SERVICEBUS",
  queueName: "createQuestion",
  handler: serviceBusHandler(queueHandler.CreateQuestion),
});

app.serviceBusQueue("UpdateQuestionQueue", {
  connection: "Zmchat_SERVICEBUS",
  queueName: "updateQuestion",
  handler: serviceBusHandler(queueHandler.UpdateQuestion),
});

app.serviceBusQueue("CreateAnswerQueue", {
  connection: "Zmchat_SERVICEBUS",
  queueName: "createAnswer",
  handler: serviceBusHandler(queueHandler.CreateAnswer),
});

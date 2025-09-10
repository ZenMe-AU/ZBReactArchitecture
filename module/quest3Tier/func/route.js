require("./shared/index.js");
require("./bootstrap/index.js");
const { app } = require("@azure/functions");
const { requestHandler, serviceBusHandler } = require("./handler/handlerWrapper.js");
const questionHandler = require("./handler/handler.js");
const sendFollowUpCmdSchema = require("./schema/sendFollowUpCmdSchema");
const shareQuestionCmdSchema = require("./schema/shareQuestionCmdSchema");
const { followUpCmdQueue, shareQuestionCmdQueue } = require("./service/serviceBus.js");

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
  extraOutputs: [followUpCmdQueue],
  authLevel: "anonymous",
  handler: requestHandler(questionHandler.SendFollowUpCmdQueue, {
    schemas: [sendFollowUpCmdSchema],
    customParams: { queueName: "followUpCmd" },
  }),
});

app.http("ShareQuestionCmd", {
  route: "shareQuestionCmd",
  methods: ["POST"],
  extraOutputs: [shareQuestionCmdQueue],
  authLevel: "anonymous",
  handler: requestHandler(questionHandler.SendShareQuestionCmdQueue, {
    schemas: [shareQuestionCmdSchema],
    customParams: { queueName: "shareQuestionCmd" },
  }),
});

app.http("getEventByCorrelationId", {
  route: "getEventByCorrelationId/{name}/{correlationId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requestHandler(questionHandler.GetEventByCorrelationId),
});

app.serviceBusQueue("sendFollowUpCmdQueue", {
  connection: "ServiceBusConnection",
  queueName: "followupcmd",
  handler: serviceBusHandler(questionHandler.SendFollowUpCmd),
});

app.serviceBusQueue("shareQuestionCmdQueue", {
  connection: "ServiceBusConnection",
  queueName: "ShareQuestionCmd",
  handler: serviceBusHandler(questionHandler.ShareQuestionCmd),
});

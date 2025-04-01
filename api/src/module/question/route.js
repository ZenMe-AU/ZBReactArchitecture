// This file is auto-loaded by functions/routes.js
const requestHandler = require("../shared/handler.js");
const questionHandler = require("./handler.js");
const schemas = require("../../schemas/index.js");

module.exports = [
  {
    name: "CreateQuestion",
    path: "question",
    methods: ["POST"],
    handler: requestHandler(questionHandler.CreateQuestion),
  },
  {
    name: "GetQuestionById",
    path: "question/{id}",
    methods: ["GET"],
    handler: requestHandler(questionHandler.GetQuestionById),
  },
  {
    name: "UpdateQuestionById",
    path: "question/{id}",
    methods: ["PUT"],
    handler: requestHandler(questionHandler.UpdateQuestionById),
  },
  {
    name: "PatchQuestionById",
    path: "question/{id}",
    methods: ["PATCH"],
    handler: requestHandler(questionHandler.PatchQuestionById),
  },
  {
    name: "AddAnswer",
    path: "question/{id}/answer",
    methods: ["POST"],
    handler: requestHandler(questionHandler.AddAnswer),
  },
  {
    name: "GetAnswerById",
    path: "question/{id:int}/answer/{answerId:int}",
    methods: ["GET"],
    handler: requestHandler(questionHandler.GetAnswerById),
  },
  {
    name: "GetQuestionListByUser",
    path: "profile/{profileId}/question",
    methods: ["GET"],
    handler: requestHandler(questionHandler.GetQuestionListByUser),
  },
  {
    name: "GetAnswerListByQuestionId",
    path: "question/{id}/answer",
    methods: ["GET"],
    handler: requestHandler(questionHandler.GetAnswerListByQuestionId),
  },
  {
    name: "ShareQuestion",
    path: "question/{id}/share",
    methods: ["POST"],
    handler: requestHandler(questionHandler.ShareQuestionById),
  },
  {
    name: "GetSharedQuestionListByUser",
    path: "profile/{profileId}/sharedQuestion",
    methods: ["GET"],
    handler: requestHandler(questionHandler.GetSharedQuestionListByUser),
  },

  {
    name: "SendFollowUpCmd",
    path: "sendFollowUpCmd",
    methods: ["POST"],
    handler: requestHandler(questionHandler.SendFollowUpCmdQueue, {
      schemas: [schemas.sendFollowUpCmdSchema],
      customParams: { queueName: "followUpCmd" },
    }),
  },
  {
    name: "ShareQuestionCmd",
    path: "shareQuestionCmd",
    methods: ["POST"],
    handler: requestHandler(questionHandler.SendShareQuestionCmdQueue, {
      schemas: [schemas.shareQuestionCmdSchema],
      customParams: { queueName: "shareQuestionCmd" },
    }),
  },
  {
    name: "getEventByCorrelationId",
    path: "getEventByCorrelationId/{name}/{correlationId}",
    methods: ["GET"],
    handler: requestHandler(questionHandler.GetEventByCorrelationId),
  },
  {
    trigger: "serviceBus",
    name: "sendFollowUpCmdQueue",
    queueName: "followupcmd",
    handler: questionHandler.SendFollowUpCmd,
  },
  {
    trigger: "serviceBus",
    name: "shareQuestionCmdQueue",
    queueName: "ShareQuestionCmd",
    handler: questionHandler.ShareQuestionCmd,
  },
];

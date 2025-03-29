// This file is auto-loaded by functions/routes.js
const requestHandler = require("../shared/handler.js");
const questionHandler = require("./questionHandler.js");
const schemas = require("../../schemas/index.js");

module.exports = [
  {
    name: "CreateQuestion",
    path: "question",
    methods: ["POST"],
    handler: questionHandler.CreateQuestion,
  },
  {
    name: "GetQuestionById",
    path: "question/{id}",
    methods: ["GET"],
    handler: questionHandler.GetQuestionById,
  },
  {
    name: "UpdateQuestionById",
    path: "question/{id}",
    methods: ["PUT"],
    handler: questionHandler.UpdateQuestionById,
  },
  {
    name: "PatchQuestionById",
    path: "question/{id}",
    methods: ["PATCH"],
    handler: questionHandler.PatchQuestionById,
  },
  {
    name: "AddAnswer",
    path: "question/{id}/answer",
    methods: ["POST"],
    handler: questionHandler.AddAnswer,
  },
  {
    name: "GetAnswerById",
    path: "question/{id:int}/answer/{answerId:int}",
    methods: ["GET"],
    handler: questionHandler.GetAnswerById,
  },
  {
    name: "GetQuestionListByUser",
    path: "profile/{profileId}/question",
    methods: ["GET"],
    handler: questionHandler.GetQuestionListByUser,
  },
  {
    name: "GetAnswerListByQuestionId",
    path: "question/{id}/answer",
    methods: ["GET"],
    handler: questionHandler.GetAnswerListByQuestionId,
  },
  {
    name: "ShareQuestion",
    path: "question/{id}/share",
    methods: ["POST"],
    handler: questionHandler.ShareQuestionById,
  },
  {
    name: "FollowUpOnQuestion",
    path: "question/{id}/FollowUp",
    methods: ["POST"],
    handler: questionHandler.FollowUpOnQuestion,
  },
  {
    name: "GetSharedQuestionListByUser",
    path: "profile/{profileId}/sharedQuestion",
    methods: ["GET"],
    handler: questionHandler.GetSharedQuestionListByUser,
  },

  {
    name: "SendFollowUpCmd",
    path: "sendFollowUpCmd",
    methods: ["POST"],
    handler: requestHandler(questionHandler.SendQueue, {
      schemas: [schemas.sendFollowUpCmdSchema],
      customParams: { queueName: "followUpCmd" },
    }),
  },
  {
    name: "ShareQuestionCmd",
    path: "shareQuestionCmd",
    methods: ["POST"],
    handler: requestHandler(questionHandler.SendQueue, {
      schemas: [schemas.shareQuestionCmdSchema],
      customParams: { queueName: "shareQuestionCmd" },
    }),
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

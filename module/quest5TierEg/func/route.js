/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { app } = require("@azure/functions");
// const { requestHandler, serviceBusHandler, eventGridHandler } = require("./handler/handlerWrapper.js");
// const apiCmdHandler = require("./handler/apiCmdHandler.js");
// const apiQryHandler = require("./handler/apiQryHandler.js");
// const queueCmdHandler = require("./handler/queueCmdHandler.js");
// const sendFollowUpCmdSchema = require("./schema/sendFollowUpCmdSchema");
// const shareQuestionCmdSchema = require("./schema/shareQuestionCmdSchema");
// const { eventGridDomain } = require("./eventGrid/output.js");
const funcMetaData = require("./funcMetaData.js");

app.http(funcMetaData.allFunctions.GetQuestion.funcName, {
  route: funcMetaData.allFunctions.GetQuestion.route,
  methods: funcMetaData.allFunctions.GetQuestion.methods,
  authLevel: funcMetaData.allFunctions.GetQuestion.authLevel,
  handler: funcMetaData.allFunctions.GetQuestion.handler,
});

app.http(funcMetaData.allFunctions.GetAnswer.funcName, {
  route: funcMetaData.allFunctions.GetAnswer.route,
  methods: funcMetaData.allFunctions.GetAnswer.methods,
  authLevel: funcMetaData.allFunctions.GetAnswer.authLevel,
  handler: funcMetaData.allFunctions.GetAnswer.handler,
});

app.http(funcMetaData.allFunctions.GetQuestionList.funcName, {
  route: funcMetaData.allFunctions.GetQuestionList.route,
  methods: funcMetaData.allFunctions.GetQuestionList.methods,
  authLevel: funcMetaData.allFunctions.GetQuestionList.authLevel,
  handler: funcMetaData.allFunctions.GetQuestionList.handler,
});

app.http(funcMetaData.allFunctions.GetAnswerList.funcName, {
  route: funcMetaData.allFunctions.GetAnswerList.route,
  methods: funcMetaData.allFunctions.GetAnswerList.methods,
  authLevel: funcMetaData.allFunctions.GetAnswerList.authLevel,
  handler: funcMetaData.allFunctions.GetAnswerList.handler,
});

app.http(funcMetaData.allFunctions.GetSharedQuestionList.funcName, {
  route: funcMetaData.allFunctions.GetSharedQuestionList.route,
  methods: funcMetaData.allFunctions.GetSharedQuestionList.methods,
  authLevel: funcMetaData.allFunctions.GetSharedQuestionList.authLevel,
  handler: funcMetaData.allFunctions.GetSharedQuestionList.handler,
});

app.http(funcMetaData.allFunctions.GetQuestionShareEventList.funcName, {
  route: funcMetaData.allFunctions.GetQuestionShareEventList.route,
  methods: funcMetaData.allFunctions.GetQuestionShareEventList.methods,
  authLevel: funcMetaData.allFunctions.GetQuestionShareEventList.authLevel,
  handler: funcMetaData.allFunctions.GetQuestionShareEventList.handler,
});

app.http(funcMetaData.allFunctions.GetFollowUpEventList.funcName, {
  route: funcMetaData.allFunctions.GetFollowUpEventList.route,
  methods: funcMetaData.allFunctions.GetFollowUpEventList.methods,
  authLevel: funcMetaData.allFunctions.GetFollowUpEventList.authLevel,
  handler: funcMetaData.allFunctions.GetFollowUpEventList.handler,
});

app.http(funcMetaData.allFunctions.CreateQuestionCmd.funcName, {
  route: funcMetaData.allFunctions.CreateQuestionCmd.route,
  methods: funcMetaData.allFunctions.CreateQuestionCmd.methods,
  authLevel: funcMetaData.allFunctions.CreateQuestionCmd.authLevel,
  handler: funcMetaData.allFunctions.CreateQuestionCmd.handler,
});

app.http(funcMetaData.allFunctions.UpdateQuestionCmd.funcName, {
  route: funcMetaData.allFunctions.UpdateQuestionCmd.route,
  methods: funcMetaData.allFunctions.UpdateQuestionCmd.methods,
  authLevel: funcMetaData.allFunctions.UpdateQuestionCmd.authLevel,
  handler: funcMetaData.allFunctions.UpdateQuestionCmd.handler,
});

app.http(funcMetaData.allFunctions.CreateAnswerCmd.funcName, {
  route: funcMetaData.allFunctions.CreateAnswerCmd.route,
  methods: funcMetaData.allFunctions.CreateAnswerCmd.methods,
  authLevel: funcMetaData.allFunctions.CreateAnswerCmd.authLevel,
  handler: funcMetaData.allFunctions.CreateAnswerCmd.handler,
});

app.http(funcMetaData.allFunctions.SendFollowUpCmd.funcName, {
  route: funcMetaData.allFunctions.SendFollowUpCmd.route,
  methods: funcMetaData.allFunctions.SendFollowUpCmd.methods,
  authLevel: funcMetaData.allFunctions.SendFollowUpCmd.authLevel,
  handler: funcMetaData.allFunctions.SendFollowUpCmd.handler,
});

app.http(funcMetaData.allFunctions.ShareQuestionCmd.funcName, {
  route: funcMetaData.allFunctions.ShareQuestionCmd.route,
  methods: funcMetaData.allFunctions.ShareQuestionCmd.methods,
  authLevel: funcMetaData.allFunctions.ShareQuestionCmd.authLevel,
  handler: funcMetaData.allFunctions.ShareQuestionCmd.handler,
});

app.eventGrid(funcMetaData.allFunctions.SendFollowUpCmd.queueFuncName, {
  handler: funcMetaData.allFunctions.SendFollowUpCmd.queueHandler,
});

app.eventGrid(funcMetaData.allFunctions.ShareQuestionCmd.queueFuncName, {
  handler: funcMetaData.allFunctions.ShareQuestionCmd.queueHandler,
});

app.eventGrid(funcMetaData.allFunctions.CreateQuestionCmd.queueFuncName, {
  handler: funcMetaData.allFunctions.CreateQuestionCmd.queueHandler,
});

app.eventGrid(funcMetaData.allFunctions.UpdateQuestionCmd.queueFuncName, {
  handler: funcMetaData.allFunctions.UpdateQuestionCmd.queueHandler,
});

app.eventGrid(funcMetaData.allFunctions.CreateAnswerCmd.queueFuncName, {
  handler: funcMetaData.allFunctions.CreateAnswerCmd.queueHandler,
});

const { app } = require("@azure/functions");
const requestHandler = require("../module/shared/handler.js");
const questionHandler = require("../module/question/questionHandler.js");
const queueHandler = require("../module/shared/queueHandler.js");
// const followUpSchema = require("../schemas/sendFollowUpCmdSchema.js");
const schemas = require("../schemas/index.js");

app.http("CreateQuestion", {
  route: "question",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: questionHandler.CreateQuestion,
});

app.http("GetQuestionById", {
  route: "question/{id}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: questionHandler.GetQuestionById,
});

app.http("UpdateQuestionById", {
  route: "question/{id}",
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: questionHandler.UpdateQuestionById,
});

app.http("AddAnswer", {
  route: "question/{id}/answer",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: questionHandler.AddAnswer,
});

app.http("GetAnswerById", {
  route: "question/{id:int}/answer/{answerId:int}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: questionHandler.GetAnswerById,
});

app.http("GetQuestionListByUser", {
  route: "profile/{profileId}/question",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: questionHandler.GetQuestionListByUser,
});

app.http("GetAnswerListByQuestionId", {
  route: "question/{id}/answer",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: questionHandler.GetAnswerListByQuestionId,
});

app.http("ShareQuestion", {
  route: "question/{id}/share",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: questionHandler.ShareQuestionById,
});

app.http("FollowUpOnQuestion", {
  route: "question/{id}/FollowUp",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: questionHandler.FollowUpOnQuestion,
});

app.http("GetSharedQuestionListByUser", {
  route: "profile/{profileId}/sharedQuestion",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: questionHandler.GetSharedQuestionListByUser,
});

app.http("PatchQuestionById", {
  route: "question/{id}",
  methods: ["PATCH"],
  authLevel: "anonymous",
  handler: questionHandler.PatchQuestionById,
});

// todo: put in swagger ui
app.http("SendFollowUpCmd", {
  route: "sendFollowUpCmd",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: requestHandler(queueHandler.SendQueue, {
    schemas: [schemas.sendFollowUpCmdSchema],
    customParams: { queueName: "followUpCmd" },
  }),
});

app.http("shareQuestionCmd", {
  route: "shareQuestionCmd",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: requestHandler(queueHandler.SendQueue, {
    schemas: [schemas.shareQuestionCmdSchema],
    customParams: { queueName: "shareQuestionCmd" },
  }),
});

// change name
app.serviceBusQueue("sendFollowUpCmdQueue", {
  connection: "Zmchat_SERVICEBUS",
  queueName: "followupcmd",
  handler: questionHandler.SendFollowUpCmd,
});

app.serviceBusQueue("shareQuestionCmdQueue", {
  connection: "Zmchat_SERVICEBUS",
  queueName: "ShareQuestionCmd",
  handler: questionHandler.ShareQuestionCmd,
});

const { app } = require("@azure/functions");
const handler = require("./handler.js");
const questionHandler = require("../handler/questionHandler.js");

app.http("SearchAtLocationQty", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: handler.SearchAtLocationQty,
});

app.http("GetUsersDataByCoord", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: handler.GetUsersDataByCoord,
});

app.http("LocationWrite", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: handler.LocationWrite,
});

app.http("SearchUsersData", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: handler.SearchUsersData,
});

app.http("GetAttributes", {
  route: "attributes/{userId}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: handler.GetAttributes,
});

app.http("PutAttributes", {
  route: "attributes/{userId}",
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: handler.PutAttributes,
});

app.http("CreateProfile", {
  route: "profile",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: handler.CreateProfile,
});

app.http("SearchProfile", {
  route: "profile",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: handler.SearchProfile,
});

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

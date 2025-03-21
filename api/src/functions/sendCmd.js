const { app } = require("@azure/functions");
const requestHandler = require("../handler/requestHandler.js");
const queueHandler = require("../handler/queueHandler.js");
// const followUpSchema = require("../schemas/sendFollowUpCmdSchema.js");
const schemas = require("../schemas");

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

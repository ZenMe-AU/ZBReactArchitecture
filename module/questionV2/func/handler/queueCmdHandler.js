const Question = require("../service/function.js");

async function CreateQuestion(message, context) {
  const { messageId, correlationId, body } = message;
  const cmd = await Question.insertQuestionCmd(messageId, body["profileId"], body, correlationId);
  const question = await Question.create(body["profileId"], body["title"], body["questionText"], body["option"]);
  await Question.updateQuestionCmdStatus(cmd["id"]);
}

async function UpdateQuestion(message, context) {
  const { messageId, correlationId, body } = message;
  const { patchData, questionId, profileId } = body;
  //TODO: put in transaction for the question id & cmd id
  const cmd = await Question.insertQuestionCmd(messageId, profileId, body, correlationId, "update");
  const questionAction = await Question.patchById(questionId, patchData, profileId);

  //TODO: write event for cmd
  await Question.updateQuestionCmdStatus(cmd["id"]);
  //end transaction
}

async function CreateAnswer(message, context) {
  const { messageId, correlationId, body } = message;
  const { questionId, profileId, answer = null, option = null, duration } = body;
  const cmd = await Question.insertQuestionAnswerCmd(messageId, profileId, body, correlationId);
  const question = await Question.addAnswerByQuestionId(questionId, profileId, duration, answer, option);
  await Question.updateQuestionAnswerCmdStatus(cmd["id"]);
}

async function SendFollowUp(message, context) {
  context.log("Service bus queue function processed message:", message);
  const { messageId, correlationId, body } = message;
  const { newQuestionId, profileId } = body;
  const cmd = await Question.insertFollowUpCmd(messageId, profileId, body, correlationId);
  const filters = Question.insertFollowUpFilter(body);
  const receiverIds = Question.getFollowUpReceiver(body);
  const sharedQuestions = Question.shareQuestion(newQuestionId, profileId, await receiverIds);

  const settled = await Promise.allSettled([filters, sharedQuestions]);
  const errors = settled.filter((result) => result.status === "rejected").map((result) => result.reason);

  if (errors.length > 0) {
    throw new Error("Operations failed: " + errors.map((e) => e.message || e).join("; "));
  }

  await Question.updateFollowUpCmdStatus(cmd["id"]);
}

async function ShareQuestion(message, context) {
  const { messageId, correlationId, body } = message;
  const { newQuestionId, profileId, receiverIds } = body;
  const cmd = await Question.insertQuestionShareCmd(messageId, profileId, body, correlationId);
  const sharedQuestions = await Question.shareQuestion(newQuestionId, profileId, receiverIds);

  await Question.updateQuestionShareCmdStatus(cmd["id"]);
}

module.exports = {
  CreateQuestion,
  UpdateQuestion,
  CreateAnswer,
  SendFollowUp,
  ShareQuestion,
};

const QuestionService = require("../service/questionService");

/**
 * ServiceBus calls CreateQuestion to create a new question.
 * It processes the question creation, updates the command status, and returns the created question.
 */
async function CreateQuestion(message, context) {
  const { messageId, correlationId, body } = message;
  const { title, questionText, option, profileId } = body;

  await QuestionService.createQuestion(messageId, profileId, body, correlationId, title, questionText, option);
}

/**
 * ServiceBus calls UpdateQuestion to update an existing question.
 * It processes the question update, applies the patch data, and updates the command status.
 */
async function UpdateQuestion(message, context) {
  const { messageId, correlationId, body } = message;
  const { patchData, questionId, profileId } = body;
  const question = await QuestionService.updateQuestion(messageId, profileId, body, correlationId, questionId, patchData);
  console.log("🥳UpdateQuestion: ", question);
}

/**
 * ServiceBus calls CreateAnswer to create an answer for a question.
 * It processes the answer creation, updates the command status, and returns the created answer.
 */
async function CreateAnswer(message, context) {
  const { messageId, correlationId, body } = message;
  const { questionId, profileId, answer: answerText = null, option = null, duration } = body;
  const answer = await QuestionService.createAnswer(messageId, profileId, body, correlationId, questionId);
  console.log("🥳CreateAnswer: ", answer);
}

/**
 * ServiceBus calls SendFollowUp to send the follow-up questions based on the answers given by the users.
 * It processes the follow-up questions, shares them with the appropriate users, and updates the command status.
 */
async function SendFollowUp(message, context) {
  const { messageId, correlationId, body } = message;
  const { questionIdList, profileId, question: filterData } = body;
  const sharedQuestions = await QuestionService.sendFollowUp(messageId, profileId, body, correlationId, questionIdList);
  console.log("🥳SendFollowUp: ", sharedQuestions);
}

/**
 * ServiceBus calls ShareQuestion to share a question with other users.
 * It processes the sharing of the question and updates the command status.
 */
async function ShareQuestion(message, context) {
  const { messageId, correlationId, body } = message;
  const { newQuestionId, profileId, receiverIds } = body;
  const sharedQuestions = await QuestionService.shareQuestion(messageId, profileId, body, correlationId, newQuestionId, receiverIds);
  console.log("🥳ShareQuestion: ", sharedQuestions);
}

module.exports = {
  CreateQuestion,
  UpdateQuestion,
  CreateAnswer,
  SendFollowUp,
  ShareQuestion,
};

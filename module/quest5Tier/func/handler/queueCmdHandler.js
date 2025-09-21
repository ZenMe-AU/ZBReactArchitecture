const QuestionService = require("../service/questionService");

/**
 * ServiceBus calls CreateQuestion to create a new question.
 * It processes the question creation, updates the command status, and returns the created question.
 */
async function CreateQuestion(message, context) {
  const { messageId, correlationId, subject: cmdType } = context.triggerMetadata;
  const { title, questionText, option, profileId } = message;

  await QuestionService.createQuestion(messageId, cmdType, message, correlationId, profileId, title, questionText, option);
}

/**
 * ServiceBus calls UpdateQuestion to update an existing question.
 * It processes the question update, applies the patch data, and updates the command status.
 */
async function UpdateQuestion(message, context) {
  const { messageId, correlationId } = context.triggerMetadata;
  const { patchData, questionId, profileId } = message;
  const question = await QuestionService.updateQuestion(messageId, profileId, message, correlationId, questionId, patchData);
  // console.log("🥳UpdateQuestion: ", question);
}

/**
 * ServiceBus calls CreateAnswer to create an answer for a question.
 * It processes the answer creation, updates the command status, and returns the created answer.
 */
async function CreateAnswer(message, context) {
  const { messageId, correlationId } = context.triggerMetadata;
  const { questionId, profileId, answer: answerText = null, option = null, duration } = message;
  const answer = await QuestionService.createAnswer(messageId, profileId, message, correlationId, questionId);
  // console.log("🥳CreateAnswer: ", answer);
}

/**
 * ServiceBus calls SendFollowUp to send the follow-up questions based on the answers given by the users.
 * It processes the follow-up questions, shares them with the appropriate users, and updates the command status.
 */
async function SendFollowUp(message, context) {
  const { messageId, correlationId } = context.triggerMetadata;
  const { questionIdList, profileId, question: filterData } = message;
  const sharedQuestions = await QuestionService.sendFollowUp(messageId, profileId, message, correlationId, questionIdList);
  // console.log("🥳SendFollowUp: ", sharedQuestions);
}

/**
 * ServiceBus calls ShareQuestion to share a question with other users.
 * It processes the sharing of the question and updates the command status.
 */
async function ShareQuestion(message, context) {
  const { messageId, correlationId } = context.triggerMetadata;
  const { newQuestionId, profileId, receiverIds } = message;
  const sharedQuestions = await QuestionService.shareQuestion(messageId, profileId, message, correlationId, newQuestionId, receiverIds);
  // console.log("🥳ShareQuestion: ", sharedQuestions);
}

module.exports = {
  CreateQuestion,
  UpdateQuestion,
  CreateAnswer,
  SendFollowUp,
  ShareQuestion,
};

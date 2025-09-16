const QuestionQueryService = require("../service/questionQueryService");
const { decode } = require("../service/authUtils");

/**
 * @swagger
 * /questionQry/getQuestion/{questionId}:
 *   get:
 *     tags:
 *       - QuestionQuery
 *     summary: Get questionnaire by ID
 *     description: Retrieve the details of a specific questionnaire by its UUID.
 *     parameters:
 *       - name: questionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Successfully retrieved questionnaire.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     detail:
 *                       type: object
 *                       description: Details of the questionnaire.
 */
async function GetQuestionById(request, context) {
  const { questionId } = request.params;
  const question = await QuestionQueryService.getById(questionId);
  return { return: { detail: question } };
}

/**
 * @swagger
 * /questionQry/getAnswer/{answerId}:
 *   get:
 *     tags:
 *       - QuestionQuery
 *     summary: Get answer by UUID
 *     description: Retrieve a specific answer by its UUID.
 *     parameters:
 *       - name: answerId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *     responses:
 *       200:
 *         description: Successfully retrieved answer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     detail:
 *                       type: object
 *                       description: Details of the answer.
 */
async function GetAnswerById(request, context) {
  const { answerId } = request.params;
  const answer = await QuestionQueryService.getAnswerById(questionId, answerId);
  return { return: { detail: answer } };
}
/**
 * @swagger
 * /questionQry/getQuestions/{profileId}:
 *   get:
 *     tags:
 *       - QuestionQuery
 *     summary: Get list of questions by user
 *     description: Retrieve all questions created by a specific user profile.
 *     parameters:
 *       - name: profileId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *     responses:
 *       200:
 *         description: Successfully retrieved list of questions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           profileId:
 *                             type: string
 *                             format: uuid
 *                           title:
 *                             type: string
 *                           question:
 *                             type: string
 *                           option:
 *                             type: array
 *                             items:
 *                               type: string
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 */
async function GetQuestionListByUser(request, context) {
  const { profileId } = request.params;
  const question = await QuestionQueryService.getCombinationListByUser(profileId);
  return { return: { list: question } };
}

/**
 * @swagger
 * /questionQry/getAnswers/{questionId}:
 *   get:
 *     tags:
 *       - QuestionQuery
 *     summary: Get list of answers for a questionnaire
 *     description: Retrieve all answers for a specific questionnaire.
 *     parameters:
 *       - name: questionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "985953ea-77d4-4b64-b11c-764d51c93b73"
 *       - name: Authorization
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer <your_jwt_token>"
 *         description: Bearer token to authorize the request.
 *     responses:
 *       200:
 *         description: Successfully retrieved answers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           profileId:
 *                             type: string
 *                             format: uuid
 *                           questionId:
 *                             type: string
 *                             format: uuid
 *                           answerText:
 *                             type: string
 *                           optionId:
 *                             type: integer
 *                             nullable: true
 *                           duration:
 *                             type: integer
 *                           isEdited:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 */
async function GetAnswerListByQuestionId(request, context) {
  const { questionId } = request.params;
  const authorization = request.headers.get("authorization");
  const token = authorization.split(" ")[1];
  const decoded = decode(token);
  const profileId = decoded.profileId;
  const answers = await QuestionQueryService.getAnswerListByQuestionId(questionId);
  const processedAnswers = answers.map((ans) => {
    return {
      ...ans,
      isEdited: ans.answerCount > 1 ? true : false,
      profileId: ans.profileId === profileId ? ans.profileId : null,
      answerCount: undefined,
    };
  });
  console.log("processedAnswers:", processedAnswers);
  return { return: { list: processedAnswers } };
}

/**
 * @swagger
 * /questionQry/getSharedQuestions/{profileId}:
 *   get:
 *     tags:
 *       - QuestionQuery
 *     summary: Get shared questions for a user
 *     description: Retrieve all questions shared with a specific user.
 *     parameters:
 *       - name: profileId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *     responses:
 *       200:
 *         description: Successfully retrieved shared questions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           questionId:
 *                             type: string
 *                             format: uuid
 *                           senderId:
 *                             type: string
 *                             format: uuid
 *                           receiverId:
 *                             type: string
 *                             format: uuid
 *                           status:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 */
async function GetSharedQuestionListByUser(request, context) {
  const { profileId } = request.params;
  const sharedQuestion = await QuestionQueryService.getSharedQuestionListByUser(profileId);
  return { return: { list: sharedQuestion } };
}

async function GetEventByCorrelationId(request, context) {
  const { correlationId } = request.params;
  const { tableName } = request.customParams;
  const result = await QuestionQueryService.getEventByCorrelationId(tableName, correlationId);
  return { return: { qty: result.length } };
}

module.exports = {
  GetQuestionById,
  GetAnswerById,
  GetAnswerListByQuestionId,
  GetQuestionListByUser,
  GetSharedQuestionListByUser,
  GetEventByCorrelationId,
};

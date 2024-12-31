const Question = require("../service/questionService.js");

/**
 * @swagger
 * /api/question:
 *   post:
 *     tags:
 *       - Question
 *     summary: Create a new questionnaire
 *     description: Creates a new questionnaire with specified questions, options, and profile ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *                 description: ID of the profile creating the questionnaire.
 *                 example: 1
 *               title:
 *                 type: string
 *                 description: Title of the questionnaire.
 *                 example: "Favorite Foods"
 *               question:
 *                 type: string
 *                 description: The main question in the questionnaire.
 *                 example: "What is your favorite food?"
 *               option:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Options for the questionnaire (optional).
 *                 example: ["Pizza", "Burger", "Sushi"]
 *     responses:
 *       200:
 *         description: Successfully created questionnaire.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID of the created questionnaire.
 *                       example: 123
 */
async function CreateQuestion(request, context) {
  const bodyText = await request.text();
  const bodyJson = JSON.parse(bodyText);
  let profileId = bodyJson["profile_id"];
  let title = bodyJson["title"] || null;
  let option = bodyJson["option"] || null;
  let question = bodyJson["question"];
  let questionnaire = await Question.create(profileId, title, question, option);
  return { jsonBody: { return: { id: questionnaire.id } } };
}

/**
 * @swagger
 * /api/question/{id}:
 *   put:
 *     tags:
 *       - Question
 *     summary: Update a question
 *     description: Update the title, question text, or options of a specific question.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The ID of the question to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 nullable: true
 *                 description: The new title of the question (optional).
 *                 example: "Updated Favorite Foods"
 *               question:
 *                 type: string
 *                 description: The updated question text.
 *                 example: "What is your updated favorite food?"
 *               option:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *                 description: Updated options for the question (optional).
 *                 example: ["Pizza", "Burger", "Sushi", "Pasta"]
 *     responses:
 *       200:
 *         description: Successfully updated the question.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the updated question.
 *                       example: 1
 */
async function UpdateQuestionById(request, context) {
  const questionId = parseInt(request.params.id);
  const bodyJson = JSON.parse(await request.text());
  let title = bodyJson["title"] || null;
  let option = bodyJson["option"] || null;
  let questionText = bodyJson["question"];
  let question = await Question.updateById(questionId, title, questionText, option);
  return { jsonBody: { return: { id: question.id } } };
}

/**
 * @swagger
 * /api/question/{id}:
 *   get:
 *     tags:
 *       - Question
 *     summary: Get questionnaire by ID
 *     description: Retrieve the details of a specific questionnaire by its ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 123
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
  const questionId = parseInt(request.params.id);
  let questionnaire = await Question.getById(questionId);
  return { jsonBody: { return: { detail: questionnaire } } };
}

/**
 * @swagger
 * /api/question/{id}/answer:
 *   post:
 *     tags:
 *       - Question
 *     summary: Add an answer to a questionnaire
 *     description: Submit an answer to a specific questionnaire.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *                 description: ID of the profile submitting the answer.
 *                 example: 1
 *               answer:
 *                 type: string
 *                 description: The answer text (optional).
 *                 example: "Pizza"
 *               option:
 *                 type: integer
 *                 description: The selected option ID (optional).
 *                 example: 2
 *     responses:
 *       200:
 *         description: Successfully added answer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID of the created answer.
 *                       example: 456
 */
async function AddAnswer(request, context) {
  const questionId = parseInt(request.params.id);
  const bodyText = await request.text();
  const bodyJson = JSON.parse(bodyText);
  let profileId = bodyJson["profile_id"];
  let answer = bodyJson["answer"] || null;
  let option = bodyJson["option"] || null;
  let questionnaire = await Question.addAnswerByQuestionId(questionId, profileId, answer, option);
  return { jsonBody: { return: { id: questionnaire.id } } };
}

/**
 * @swagger
 * /api/question/{id}/answer/{answerId}:
 *   get:
 *     tags:
 *       - Question
 *     summary: Get answer by ID
 *     description: Retrieve a specific answer by its ID for a given questionnaire.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 123
 *       - name: answerId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 456
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
  const questionId = parseInt(request.params.id);
  const answerId = parseInt(request.params.answerId);
  let answer = await Question.getAnswerById(questionId, answerId);
  return { jsonBody: { return: { detail: answer } } };
}

/**
 * @swagger
 * /api/profile/{profileId}/question:
 *   get:
 *     tags:
 *       - Question
 *     summary: Get list of question by user
 *     description: Retrieve all question created by a specific user.
 *     parameters:
 *       - name: profileId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 955
 *     responses:
 *       200:
 *         description: Successfully retrieved list of question.
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
 *                             type: integer
 *                             example: 1
 *                           profile_id:
 *                             type: integer
 *                             example: 955
 *                           title:
 *                             type: string
 *                             example: "Favorite Foods"
 *                           question:
 *                             type: string
 *                             example: "What is your favorite food?"
 *                           option:
 *                             type: array
 *                             items:
 *                               type: string
 *                             nullable: true
 *                             example: ["Pizza", "Burger", "Sushi"]
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-12-18T13:05:14.411Z"
 */
async function GetQuestionListByUser(request, context) {
  const profileId = parseInt(request.params.profileId);
  let question = await Question.getListByUser(profileId);
  return { jsonBody: { return: { list: question } } };
}

/**
 * @swagger
 * /api/question/{id}/answer:
 *   get:
 *     tags:
 *       - Question
 *     summary: Get list of answers for a questionnaire
 *     description: Retrieve all answers submitted for a specific questionnaire.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Successfully retrieved list of answers.
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
 *                             type: integer
 *                             example: 1
 *                           profile_id:
 *                             type: integer
 *                             example: 999
 *                           questionnaire_id:
 *                             type: integer
 *                             example: 2
 *                           answer:
 *                             type: string
 *                             nullable: true
 *                             example: "Pizza"
 *                           option:
 *                             type: integer
 *                             nullable: true
 *                             description: The index of the selected option (starting from 0).
 *                             example: 1
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-12-18T17:49:08.219Z"
 */
async function GetAnswerListByQuestionId(request, context) {
  const questionId = parseInt(request.params.id);
  let answers = await Question.getAnswerListByQuestionId(questionId);
  return { jsonBody: { return: { list: answers } } };
}

/**
 * @swagger
 * /api/question/{id}/share:
 *   post:
 *     tags:
 *       - Question
 *     summary: Share a question
 *     description: Share a specific question with one or more users.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The ID of the question to share.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *                 description: The ID of the sender's profile.
 *                 example: 123
 *               receiver_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: A list of profile IDs of the receivers.
 *                 example: [456, 789]
 *     responses:
 *       200:
 *         description: Successfully shared the question.
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
 *                       description: Details about the share operation.
 *                       example:
 *                         question_id: 1
 *                         sender_id: 123
 *                         receivers: [456, 789]
 */
async function ShareQuestionById(request, context) {
  const questionId = parseInt(request.params.id);
  const bodyJson = JSON.parse(await request.text());
  let senderId = bodyJson["profile_id"] ?? null;
  let receiverIds = bodyJson["receiver_ids"] ?? [];
  let share = await Question.addShareByQuestionId(questionId, senderId, receiverIds);
  return { jsonBody: { return: { detail: share } } };
}

module.exports = {
  CreateQuestion,
  UpdateQuestionById,
  GetQuestionById,
  AddAnswer,
  GetAnswerById,
  GetQuestionListByUser,
  GetAnswerListByQuestionId,
  ShareQuestionById,
};

const Question = require("../service/questionService.js");
const { decode } = require("../service/utils/authUtils");

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
  const questionId = request.params.id;
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
  const questionId = request.params.id;
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
  const questionId = request.params.id;
  const bodyText = await request.text();
  const bodyJson = JSON.parse(bodyText);
  let profileId = bodyJson["profile_id"];
  let answer = bodyJson["answer"] || null;
  let option = bodyJson["option"] || null;
  let duration = bodyJson["duration"];
  let questionnaire = await Question.addAnswerByQuestionId(questionId, profileId, duration, answer, option);
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
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
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
  const questionId = request.params.id;
  const answerId = request.params.answerId;
  let answer = await Question.getAnswerById(questionId, answerId);
  return { jsonBody: { return: { detail: answer } } };
}

/**
 * @swagger
 * /api/profile/{profileId}/question:
 *   get:
 *     tags:
 *       - Question
 *     summary: Get list of questions by user
 *     description: Retrieve all questions created by a specific user.
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
 *                             example: "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
 *                           profile_id:
 *                             type: string
 *                             format: uuid
 *                             example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
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
  const profileId = request.params.profileId;
  let question = await Question.getCombinationListByUser(profileId);
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
 *                             type: string
 *                             format: uuid
 *                             example: "d520b3fb-f2ce-4d08-b865-6d813812b7c3"
 *                           profileId:
 *                             type: integer
 *                             nullable: true
 *                             example: null
 *                           questionId:
 *                             type: string
 *                             format: uuid
 *                             example: "985953ea-77d4-4b64-b11c-764d51c93b73"
 *                           answerText:
 *                             type: string
 *                             nullable: true
 *                             example: "I think it's Mandarin? Not sure if Taiwanese counts."
 *                           optionId:
 *                             type: integer
 *                             nullable: true
 *                             description: The index of the selected option (starting from 0).
 *                             example: null
 *                           duration:
 *                             type: integer
 *                             description: Time spent answering the question (in seconds).
 *                             example: 587
 *                           isEdited:
 *                             type: boolean
 *                             description: Indicates if the answer has been edited.
 *                             example: false
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-02-15T15:42:36.892Z"
 */
async function GetAnswerListByQuestionId(request, context) {
  const questionId = request.params.id;
  const authorization = request.headers.get("authorization");
  const token = authorization.split(" ")[1];
  const decoded = decode(token);
  const profileId = decoded.profileId;
  let answers = await Question.getAnswerListByQuestionId(questionId);
  const processedAnswers = answers.map((ans) => {
    return {
      ...ans,
      isEdited: ans.answerCount > 1 ? true : false,
      profileId: ans.profileId === profileId ? ans.profileId : null,
      answerCount: undefined,
    };
  });
  return { jsonBody: { return: { list: processedAnswers } } };
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
  const questionId = request.params.id;
  const bodyJson = JSON.parse(await request.text());
  let senderId = bodyJson["profile_id"] ?? null;
  let receiverIds = bodyJson["receiver_ids"] ?? [];
  let share = await Question.addShareByQuestionId(questionId, senderId, receiverIds);
  return { jsonBody: { return: { detail: share } } };
}

/**
 * @swagger
 * /api/profile/{profileId}/sharedQuestion:
 *   get:
 *     tags:
 *       - Question
 *     summary: Get shared questions for a user
 *     description: Retrieve the list of questions shared with the specified user.
 *     parameters:
 *       - name: profileId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 123
 *         description: The ID of the profile to retrieve shared questions for.
 *     responses:
 *       200:
 *         description: Successfully retrieved the shared questions.
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
 *                             description: The unique identifier of the shared question record.
 *                             example: "f6c1d743-a63b-4818-b75d-a62b453e6080"
 *                           questionId:
 *                             type: string
 *                             format: uuid
 *                             description: The unique identifier of the question.
 *                             example: "9f69968b-0689-435a-8694-4f9b78b87f11"
 *                           senderId:
 *                             type: integer
 *                             description: The ID of the user who shared the question.
 *                             example: 1007
 *                           receiverId:
 *                             type: integer
 *                             description: The ID of the user receiving the shared question.
 *                             example: 258
 *                           status:
 *                             type: integer
 *                             description: The status of the shared question.
 *                             example: 0
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             description: The timestamp when the question was shared.
 *                             example: "2025-01-03T09:46:18.739Z"
 */
async function GetSharedQuestionListByUser(request, context) {
  const profileId = request.params.profileId;
  let sharedQuestion = await Question.getSharedQuestionListByUser(profileId);
  return { jsonBody: { return: { list: sharedQuestion } } };
}

/**
 * @swagger
 * /api/question/{id}:
 *   patch:
 *     tags:
 *       - Question
 *     summary: Update a question using JSON Patch
 *     description: Apply JSON Patch operations to update a question's data. Changes are recorded in the question_action table.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         description: The UUID of the question to update.
 *       - name: x-profile-id
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *           example: "45678"
 *         description: The ID of the profile making the request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json-patch+json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 op:
 *                   type: string
 *                   enum: [add, remove, replace, move, copy, test]
 *                   description: The operation to perform.
 *                 path:
 *                   type: string
 *                   description: The JSON Pointer path to the field to operate on.
 *                   example: "/title"
 *                 value:
 *                   type: string
 *                   description: The value to set (required for `add` and `replace` operations).
 *                   example: "Updated Title"
 *     responses:
 *       200:
 *         description: Successfully queued patch operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: The unique identifier of the created question_action record.
 *                       example: "b08992c2-7c89-43a6-a152-9d24a74349a7"
 */
async function PatchQuestionById(request, context) {
  const questionId = request.params.id;
  const profileId = request.headers.get("x-profile-id");
  // const patches = request.body;
  const bodyJson = JSON.parse(await request.text());
  let questionAction = await Question.patchById(questionId, bodyJson, profileId);
  return { jsonBody: { return: { id: questionAction.id } } };
}

/**
 * @swagger
 * /api/question/{id}/followUp:
 *   post:
 *     tags:
 *       - Question
 *     summary: Follow up on a question
 *     description: Create a follow-up action for a specific question.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         description: The UUID of the question to follow up on.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: string
 *                 format: uuid
 *                 description: The UUID of the user's profile performing the follow-up.
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               question:
 *                 type: object
 *                 description: Question details.
 *                 properties:
 *                   option:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of options related to the question.
 *                     example: ["Option 1", "Option 2"]
 *                   question_id:
 *                     type: string
 *                     format: uuid
 *                     description: The UUID of the question being followed up.
 *                     example: "550e8400-e29b-41d4-a716-446655440111"
 *               save:
 *                 type: boolean
 *                 description: Indicates whether the follow-up should be saved.
 *                 example: true
 *     responses:
 *       200:
 *         description: Successfully created a follow-up action.
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
 *                       description: Details about the follow-up action.
 *                       example:
 *                         profile_id: "123e4567-e89b-12d3-a456-426614174000"
 *                         question:
 *                           option: ["Option 1", "Option 2"]
 *                           questionId: "550e8400-e29b-41d4-a716-446655440111"
 *                         save: true
 */
async function FollowUpOnQuestion(request, context) {
  const questionId = request.params.id;
  const bodyJson = JSON.parse(await request.text());
  let profileId = bodyJson["profile_id"] ?? null;
  let question = bodyJson["question"] ?? {};
  let isSave = bodyJson["save"] ?? false;

  let followUp = await Question.addFollowUpByQuestionId(questionId, profileId, question, isSave);

  return { jsonBody: { return: { detail: followUp } } };
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
  GetSharedQuestionListByUser,
  PatchQuestionById,
  FollowUpOnQuestion,
};

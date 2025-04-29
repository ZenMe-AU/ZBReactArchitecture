const Question = require("./service/function.js");
const { decode } = require("../shared/service/authUtils.js");
const { sendMessageToQueue } = require("../shared/service/function.js");
const { followUpCmdQueue, shareQuestionCmdQueue } = require("../shared/service/serviceBus.js");

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
 *               profileId:
 *                 type: integer
 *                 description: ID of the profile creating the questionnaire.
 *                 example: 1
 *               title:
 *                 type: string
 *                 description: Title of the questionnaire.
 *                 example: "Favorite Foods"
 *               questionText:
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
  const { profileId, title = null, option = null, questionText } = request.clientParams;
  const questionnaire = await Question.create(profileId, title, questionText, option);
  return { return: { id: questionnaire.id } };
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
 *               questionText:
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
  const { id: questionId } = request.params;
  const { title = null, option = null, questionText } = request.clientParams;
  const question = await Question.updateById(questionId, title, questionText, option);
  return { return: { id: question.id } };
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
  const { id: questionId } = request.params;
  const questionnaire = await Question.getById(questionId);
  return { return: { detail: questionnaire } };
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
 *               profileId:
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
  const { id: questionId } = request.params;
  const { profileId, answer = null, option = null, duration } = request.clientParams;
  const questionnaire = await Question.addAnswerByQuestionId(questionId, profileId, duration, answer, option);
  return { return: { id: questionnaire.id } };
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
  const { id: questionId, answerId } = request.params;
  const answer = await Question.getAnswerById(questionId, answerId);
  return { return: { detail: answer } };
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
 *                           profileId:
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
  const { profileId } = request.params;
  const question = await Question.getCombinationListByUser(profileId);
  return { return: { list: question } };
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
  const { id: questionId } = request.params;
  const authorization = request.headers.get("authorization");
  const token = authorization.split(" ")[1];
  const decoded = decode(token);
  const profileId = decoded.profileId;
  const answers = await Question.getAnswerListByQuestionId(questionId);
  const processedAnswers = answers.map((ans) => {
    return {
      ...ans,
      isEdited: ans.answerCount > 1 ? true : false,
      profileId: ans.profileId === profileId ? ans.profileId : null,
      answerCount: undefined,
    };
  });
  return { return: { list: processedAnswers } };
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
 *               profileId:
 *                 type: integer
 *                 description: The ID of the sender's profile.
 *                 example: 123
 *               receiverIds:
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
 *                         questionId: 1
 *                         senderId: 123
 *                         receivers: [456, 789]
 */
async function ShareQuestionById(request, context) {
  const { id: questionId } = request.params;
  const { profileId: senderId = null, receiverIds = [] } = request.clientParams;
  const share = await Question.shareQuestion(questionId, senderId, receiverIds);
  return { return: { detail: share } };
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
  const { profileId } = request.params;
  const sharedQuestion = await Question.getSharedQuestionListByUser(profileId);
  return { return: { list: sharedQuestion } };
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
  const { id: questionId } = request.params;
  const profileId = request.headers.get("x-profile-id");
  const questionAction = await Question.patchById(questionId, request.clientParams, profileId);
  return { return: { id: questionAction.id } };
}

/**
 * @swagger
 * /api/sendFollowUpCmd:
 *   post:
 *     tags:
 *       - Question
 *     summary: Follow up on a question
 *     description: Create a follow-up action for a specific question.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileId:
 *                 type: string
 *                 format: uuid
 *                 description: The UUID of the user's profile performing the follow-up.
 *                 example: "7a232055-5355-422a-9ca7-b7e567103fd4"
 *               newQuestionId:
 *                 type: string
 *                 format: uuid
 *                 description: The UUID of the new question being followed up.
 *                 example: "945515c2-bf55-40f6-aba2-ae0fa0c88507"
 *               question:
 *                 type: array
 *                 description: List of questions to follow up on.
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                       format: uuid
 *                       description: The UUID of the question being followed up.
 *                       example: "12c9a107-53c2-4b77-8cf7-d58856a582da"
 *                     option:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of options related to the question.
 *                       example: ["Chushan"]
 *               isSave:
 *                 type: boolean
 *                 description: Indicates whether the follow-up should be saved.
 *                 example: true
 *               correlationId:
 *                 type: string
 *                 format: uuid
 *                 description: An optional correlation ID for tracking requests.
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *                 required: false
 *     responses:
 *       200:
 *         description: Successfully created a follow-up action.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the request was successful.
 *                   example: true
 *                 return:
 *                   type: boolean
 *                   description: Indicates whether the follow-up was successfully processed.
 *                   example: true
 */
async function SendFollowUpCmdQueue(request, context) {
  await sendMessageToQueue(request.customParams.queueName, request.clientParams, request.correlationId);
  // console.log("invocationId:", context.invocationId);
  // put correlationId into service bus from ui
  // fix this: put correlationId
  // context.extraOutputs.set(followUpCmdQueue, request.clientParams);
  return { return: true };
}

/**
 * @swagger
 * /api/shareQuestionCmd:
 *   post:
 *     tags:
 *       - Question
 *     summary: Share a question
 *     description: Share a specific question with one or more users.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileId:
 *                 type: string
 *                 format: uuid
 *                 description: The UUID of the sender's profile.
 *                 example: "7a232055-5355-422a-9ca7-b7e567103fd4"
 *               newQuestionId:
 *                 type: string
 *                 format: uuid
 *                 description: The UUID of the question being shared.
 *                 example: "12c9a107-53c2-4b77-8cf7-d58856a582da"
 *               receiverIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: A list of UUIDs of the receivers.
 *                 example: ["76c527d3-9f37-4605-aac6-65527f7392da"]
 *               correlationId:
 *                 type: string
 *                 format: uuid
 *                 description: An optional correlation ID for tracking requests.
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *                 required: false
 *     responses:
 *       200:
 *         description: Successfully shared the question.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the request was successful.
 *                   example: true
 *                 return:
 *                   type: boolean
 *                   description: Indicates whether the question was successfully shared.
 *                   example: true
 */
async function SendShareQuestionCmdQueue(request, context) {
  await sendMessageToQueue(request.customParams.queueName, request.clientParams, request.correlationId);
  // fix this: put correlationId
  // todo:correlationId allow nulll\
  // context.extraOutputs.set(shareQuestionCmdQueue, request.clientParams);

  return { return: true };
}

/**
 * @swagger
 * /api/getEventByCorrelationId/{name}/{correlationId}:
 *   get:
 *     tags:
 *       - Event
 *     summary: Get event by correlation ID
 *     description: Retrieve event details based on the event name and correlation ID.
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [FollowUpCmd, ShareQuestionCmd]
 *         description: The event name (must be one of the predefined command names).
 *         example: "FollowUpCmd"
 *       - name: correlationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID correlation ID of the event.
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Successfully retrieved event details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                   example: true
 *                 return:
 *                   type: object
 *                   properties:
 *                     qty:
 *                       type: integer
 *                       description: The quantity of items.
 *                       example: 5
 */
async function GetEventByCorrelationId(request, context) {
  const { name, correlationId } = request.params;
  const result = await Question.getEventByCorrelationId(name, correlationId);
  return { return: { qty: result.length } };
}

async function SendFollowUpCmd(message, context) {
  context.log("Service bus queue function processed message:", message);
  //get message id into db as followupcmd.id
  // also get correlationId from service bus not from msg body
  try {
    // todo: change to insert / update / delete
    // await insertFollowUpCmd(message["profileId"], message);
    //
    // const correlationId = context.triggerMetadata.correlationId;
    // const messageId = context.triggerMetadata.messageId;
    const { messageId, correlationId } = context.triggerMetadata;
    const cmd = await Question.insertFollowUpCmd(messageId, message["profileId"], message, correlationId);
    const filters = Question.insertFollowUpFilter(message);
    const receiverIds = Question.getFollowUpReceiver(message);
    const sharedQuestions = Question.shareQuestion(message["newQuestionId"], message["profileId"], await receiverIds);

    const [resolvedFilters, resolvedSharedQuestions] = await Promise.all([filters, sharedQuestions]);

    await Question.updateFollowUpCmdStatus(cmd["id"]);

    context.log(`resolvedFilters`, resolvedFilters);
    context.log(`resolvedSharedQuestions`, resolvedSharedQuestions);
    context.log(`✅ Succeed:`, message);
  } catch (error) {
    context.log(`❌ Failed:`, error);
    throw error;
  }
}

async function ShareQuestionCmd(message, context) {
  context.log("Service bus queue function processed message:", message);

  try {
    const { messageId, correlationId } = context.triggerMetadata;
    const cmd = await Question.insertQuestionShareCmd(messageId, message["profileId"], message, correlationId);
    const sharedQuestions = await Question.shareQuestion(message["newQuestionId"], message["profileId"], message["receiverIds"]);

    await Question.updateQuestionShareCmdStatus(cmd["id"]);
    context.log(`sharedQuestions:`, sharedQuestions);
    context.log(`✅ Succeed:`, message);
  } catch (error) {
    context.log(`❌ Failed:`, error);
    throw error;
  }
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
  SendFollowUpCmd,
  ShareQuestionCmd,
  SendFollowUpCmdQueue,
  SendShareQuestionCmdQueue,
  GetEventByCorrelationId,
};

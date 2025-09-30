// const { sendFollowUp, shareQuestion, createQuestion, updateQuestion, createAnswer } = require("../service/serviceBus");
const { sendMessageToQueue } = require("../serviceBus/function");
/**
 * @swagger
 * /questionCmd/createQuestion:
 *   post:
 *     tags:
 *       - QuestionCommands
 *     summary: Create a new questionnaire
 *     description: Creates a new questionnaire with specified questions, options, and profile ID.
 *     parameters:
 *       - in: header
 *         name: X-Correlation-Id
 *         required: false
 *         schema:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-000000000000"
 *         description: Correlation ID for tracing requests
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
 *                 description: UUID of the profile creating the questionnaire.
 *                 example: "7a232055-5355-422a-9ca7-b7e567103fd4"
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
 *                 success:
 *                   type: boolean
 *                   description: Whether the request was successful.
 *                   example: true
 *                 return:
 *                   type: boolean
 *                   description: Indicates whether the follow-up was successfully processed.
 *                   example: true
 */
async function CreateQuestion(request, context) {
  // const messageBody = {
  //   body: {
  //     ...(request.clientParams ?? {}),
  //   },
  //   correlationId: request.correlationId,
  // };
  // context.extraOutputs.set(createQuestion, messageBody);
  const body = request.clientParams ?? {};
  const queueName = "createQuestion";
  const correlationId = request.correlationId;

  const messageId = await sendMessageToQueue({ body, queueName, correlationId });
  return { return: { messageId } };
}

/**
 * @swagger
 * /questionCmd/updateQuestion/{questionId}:
 *   post:
 *     tags:
 *       - QuestionCommands
 *     summary: Update a question using JSON Patch
 *     description: Apply JSON Patch operations to update a question's data. Changes are recorded in the question_action table.
 *     parameters:
 *       - name: questionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "12c9a107-53c2-4b77-8cf7-d58856a582da"
 *         description: The UUID of the question to update.
 *       - name: X-Correlation-Id
 *         in: header
 *         required: false
 *         schema:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-000000000000"
 *         description: Correlation ID for tracing requests.
 *       - name: x-profile-id
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "7a232055-5355-422a-9ca7-b7e567103fd4"
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
async function UpdateQuestion(request, context) {
  // const { questionId } = request.params;
  // const messageBody = {
  //   body: {
  //     patchData: request.clientParams ?? {},
  //     questionId,
  //     profileId: request.headers.get("x-profile-id"),
  //   },
  //   correlationId: request.correlationId,
  // };
  // context.extraOutputs.set(updateQuestion, messageBody);
  const { questionId } = request.params;
  const body = {
    patchData: request.clientParams ?? {},
    questionId,
    profileId: request.headers.get("x-profile-id"),
  };
  const queueName = "updateQuestion";
  const correlationId = request.correlationId;

  const messageId = await sendMessageToQueue({ body, queueName, correlationId });
  return { return: { messageId } };
}

/**
 * @swagger
 * /questionCmd/createAnswer/{questionId}:
 *   post:
 *     tags:
 *       - QuestionCommands
 *     summary: Add an answer to a questionnaire
 *     description: Submit an answer to a specific questionnaire.
 *     parameters:
 *       - name: questionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "12c9a107-53c2-4b77-8cf7-d58856a582da"
 *       - in: header
 *         name: X-Correlation-Id
 *         required: false
 *         schema:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-000000000000"
 *         description: Correlation ID for tracing requests
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
 *                 description: UUID of the profile creating the questionnaire.
 *                 example: "7a232055-5355-422a-9ca7-b7e567103fd4"
 *               answer:
 *                 type: string
 *                 description: The answer text (optional).
 *                 example: "Pizza"
 *               option:
 *                 type: integer
 *                 description: The selected option ID (optional).
 *                 example: 2
 *               duration:
 *                 type: integer
 *                 description: Duration in milliseconds.
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Successfully added answer.
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
async function CreateAnswer(request, context) {
  // const { questionId } = request.params;
  // const messageBody = {
  //   body: {
  //     ...(request.clientParams ?? {}),
  //     questionId,
  //   },
  //   correlationId: request.correlationId,
  // };
  // context.extraOutputs.set(createAnswer, messageBody);
  const { questionId } = request.params;
  const body = {
    ...(request.clientParams ?? {}),
    questionId,
  };
  const queueName = "createAnswer";
  const correlationId = request.correlationId;

  const messageId = await sendMessageToQueue({ body, queueName, correlationId });
  return { return: { messageId } };
}

/**
 * @swagger
 * /questionCmd/sendFollowUp:
 *   post:
 *     tags:
 *       - QuestionCommands
 *     summary: Follow up on a question
 *     description: Create a follow-up action for a specific question.
 *     parameters:
 *       - in: header
 *         name: X-Correlation-Id
 *         required: false
 *         schema:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-000000000000"
 *         description: Correlation ID for tracing requests
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
 *               questionIdList:
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
async function SendFollowUp(request, context) {
  // const messageBody = {
  //   body: {
  //     ...(request.clientParams ?? {}),
  //   },
  //   correlationId: request.correlationId,
  // };
  // context.extraOutputs.set(sendFollowUp, messageBody);
  const body = request.clientParams ?? {};
  const queueName = "sendFollowUp";
  const correlationId = request.correlationId;

  const messageId = await sendMessageToQueue({ body, queueName, correlationId });
  return { return: { messageId } };
}

/**
 * @swagger
 * /questionCmd/shareQuestion:
 *   post:
 *     tags:
 *       - QuestionCommands
 *     summary: Share a question
 *     description: Share a specific question with one or more users.
 *     parameters:
 *       - in: header
 *         name: X-Correlation-Id
 *         required: false
 *         schema:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-000000000001"
 *         description: Correlation ID for tracing requests
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
 *               questionId:
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
async function ShareQuestion(request, context) {
  // const messageBody = {
  //   body: {
  //     ...(request.clientParams ?? {}),
  //   },
  //   correlationId: request.correlationId,
  // };
  // context.extraOutputs.set(shareQuestion, messageBody);
  const body = request.clientParams ?? {};
  const queueName = "sendFollowUp";
  const correlationId = request.correlationId;

  const messageId = await sendMessageToQueue({ body, queueName, correlationId });
  return { return: { messageId } };
}

module.exports = {
  CreateQuestion,
  UpdateQuestion,
  CreateAnswer,
  SendFollowUp,
  ShareQuestion,
};

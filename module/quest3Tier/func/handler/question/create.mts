/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { getRepository } from "../../repository/getRepository.mjs";

type CreateQuestionRequest = {
  userData: { profileId: string };
  clientParams: {
    title?: string | null;
    option?: string[] | null;
    questionText: string;
  };
};

type CreateQuestionResponse = {
  return: { id: string };
};

/**
 * @swagger
 * /question:
 *   post:
 *     tags:
 *       - Question
 *     summary: Create a new questionnaire
 *     description: Creates a new questionnaire for the authenticated profile.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
export async function CreateQuestion(request: CreateQuestionRequest, context: unknown): Promise<CreateQuestionResponse> {
  const repository = getRepository();
  const profileId = request.userData.profileId;
  const { title = null, option = null, questionText } = request.clientParams;
  const questionnaire = await repository.create(profileId, title, questionText, option);
  return { return: { id: questionnaire.id } };
}
/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { getRepository } from "../../repository/getRepository.mjs";
import type { QuestionRecord } from "../../repository/contracts.mjs";
import { toExternalProfileId } from "../profileId.mjs";

type RequestWithQuestionId = {
  params: { id: string };
};

type HandlerResponse = {
  return: { detail: QuestionRecord | null };
};

/**
 * @swagger
 * /question/{id}:
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
export async function GetQuestionById(request: RequestWithQuestionId, context: unknown): Promise<HandlerResponse> {
  const { id: questionId } = request.params;
  let questionnaire: QuestionRecord | null = await getRepository().getById(questionId);
  if (!questionnaire) return { return: { detail: null } };
  return { return: { detail: { ...questionnaire, profileId: await toExternalProfileId(questionnaire.profileId) } } };
}

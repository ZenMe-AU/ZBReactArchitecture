/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { z } from "zod";
import { uuidSchema } from "./commonSchema.mjs";
import cmdName from "../enum/cmdName.mjs";

export const questionIdParams = z.object({ id: uuidSchema });

export const answerIdParams = z.object({ id: uuidSchema, answerId: uuidSchema });

export const eventParams = z.object({ name: z.enum(cmdName), correlationId: z.string() });

export const questionBodySchema = z
  .object({
    title: z.string().nullable().optional(),
    questionText: z.string(),
    option: z.array(z.string()).nullable().optional(),
  })
  .meta({ id: "QuestionBody" });

export const questionPatchSchema = z
  .array(
    z.object({
      op: z.enum(["add", "remove", "replace", "move", "copy", "test"]),
      path: z.string(),
      from: z.string().optional(),
      value: z.unknown().optional(),
    })
  )
  .meta({ id: "JsonPatch" });

export const answerBodySchema = z
  .object({
    answer: z.string().nullable().optional(),
    option: z.string().nullable().optional(),
    duration: z.int(),
  })
  .meta({ id: "AnswerBody" });

export const shareQuestionBodySchema = z.object({ receiverIds: z.array(uuidSchema).optional() }).meta({ id: "ShareQuestionBody" });

export const questionRecordSchema = z
  .object({
    id: z.uuid(),
    profileId: z.uuid(),
    title: z.string().nullable(),
    questionText: z.string(),
    option: z.array(z.string()).nullable(),
    createdAt: z.iso.datetime().optional(),
  })
  .meta({ id: "Question" });

export const answerRecordSchema = z
  .object({
    id: z.uuid(),
    questionId: z.uuid(),
    profileId: z.uuid().nullable(),
    answerText: z.string().nullable(),
    optionId: z.string().nullable(),
    duration: z.int(),
    createdAt: z.iso.datetime(),
  })
  .meta({ id: "Answer" });

export const answerListItemSchema = answerRecordSchema.extend({ isEdited: z.boolean() }).meta({ id: "AnswerListItem" });

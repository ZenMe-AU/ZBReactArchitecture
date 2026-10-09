/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */


import {
  profileRepository as Profile,
  questionRepository as Question,
  questionAnswerRepository as QuestionAnswer,
  questionActionRepository as QuestionAction,
  followUpCmdRepository as FollowUpCmd,
  followUpEventRepository as FollowUpEvent,
  questionShareRepository as QuestionShare,
  questionShareCmdRepository as QuestionShareCmd,
  questionShareEventRepository as QuestionShareEvent,
  questionLogRepository as QuestionLog,
} from "../tableClient.mjs";

export default {
  Question,
  QuestionAnswer,
  Profile,
  QuestionAction,
  FollowUpCmd,
  FollowUpEvent,
  QuestionShare,
  QuestionShareCmd,
  QuestionShareEvent,
  QuestionLog,
};

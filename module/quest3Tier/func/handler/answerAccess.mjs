/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

export const visibleAnswers = (ownerId, requesterId, answers) =>
  ownerId === requesterId ? answers : answers.filter((answer) => answer.profileId === requesterId);

export const visibleAnswer = (ownerId, requesterId, answer) =>
  answer && (ownerId === requesterId || answer.profileId === requesterId) ? answer : null;

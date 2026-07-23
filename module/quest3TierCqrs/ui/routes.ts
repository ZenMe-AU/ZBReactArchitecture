/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import type { RouteConfig } from "@react-router/dev/routes";
import { route, index, layout } from "@react-router/dev/routes";

export const protectedRoutes = [
  route("quest3TierCqrs", "../../module/quest3TierCqrs/ui/routes/QuestionCombinationList.tsx"),
  route("/quest3TierCqrs/:id", "../../module/quest3TierCqrs/ui/routes/QuestionDetail.tsx"),
  route("/quest3TierCqrs/:id/add", "../../module/quest3TierCqrs/ui/routes/QuestionDetailAdd.tsx"),
  route("/quest3TierCqrs/:id/answer", "../../module/quest3TierCqrs/ui/routes/AnswerQuestion.tsx"),
  route("/quest3TierCqrs/:id/followUp", "../../module/quest3TierCqrs/ui/routes/FollowUpQuestion.tsx"),
  route("/quest3TierCqrs/add", "../../module/quest3TierCqrs/ui/routes/AddQuestion.tsx"),
  route("/quest3TierCqrs/:id/edit", "../../module/quest3TierCqrs/ui/routes/EditQuestion.tsx"),
  route("/quest3TierCqrs/:id/share", "../../module/quest3TierCqrs/ui/routes/ShareQuestion.tsx"),
];
export const publicRoutes = [];

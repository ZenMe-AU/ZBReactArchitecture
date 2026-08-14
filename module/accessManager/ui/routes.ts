/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import type { RouteConfig } from "@react-router/dev/routes";
import { route, index, layout } from "@react-router/dev/routes";

export const protectedRoutes = [
  route("accessManager", "../../module/accessManager/ui/routes/QuestionCombinationList.tsx"),
  route("/accessManager/:id", "../../module/accessManager/ui/routes/QuestionDetail.tsx"),
  route("/accessManager/:id/add", "../../module/accessManager/ui/routes/QuestionDetailAdd.tsx"),
  route("/accessManager/:id/answer", "../../module/accessManager/ui/routes/AnswerQuestion.tsx"),
  route("/accessManager/:id/followUp", "../../module/accessManager/ui/routes/FollowUpQuestion.tsx"),
  route("/accessManager/add", "../../module/accessManager/ui/routes/AddQuestion.tsx"),
  route("/accessManager/:id/edit", "../../module/accessManager/ui/routes/EditQuestion.tsx"),
  route("/accessManager/:id/share", "../../module/accessManager/ui/routes/ShareQuestion.tsx"),
];
export const publicRoutes = [];

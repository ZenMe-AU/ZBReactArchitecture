import type { RouteConfig } from "@react-router/dev/routes";
import { route, index, layout } from "@react-router/dev/routes";

export const protectedRoutes = [
  route("questionV2", "../../module/questionV2/ui/routes/QuestionCombinationList.tsx"),
  route("/questionV2/:id", "../../module/questionV2/ui/routes/QuestionDetail.tsx"),
  route("/questionV2/:id/add", "../../module/questionV2/ui/routes/QuestionDetailAdd.tsx"),
  route("/questionV2/:id/answer", "../../module/questionV2/ui/routes/AnswerQuestion.tsx"),
  route("/questionV2/:id/followUp", "../../module/questionV2/ui/routes/FollowUpQuestion.tsx"),
  route("/questionV2/add", "../../module/questionV2/ui/routes/AddQuestion.tsx"),
  route("/questionV2/:id/edit", "../../module/questionV2/ui/routes/EditQuestion.tsx"),
  route("/questionV2/:id/share", "../../module/questionV2/ui/routes/ShareQuestion.tsx"),
];
export const publicRoutes = [];

import type { RouteConfig } from "@react-router/dev/routes";
import { route, index, layout } from "@react-router/dev/routes";

export const protectedRoutes = [
  route("questionV3", "../../module/questionV3/ui/routes/QuestionCombinationList.tsx"),
  route("/questionV3/:id", "../../module/questionV3/ui/routes/QuestionDetail.tsx"),
  route("/questionV3/:id/add", "../../module/questionV3/ui/routes/QuestionDetailAdd.tsx"),
  route("/questionV3/:id/answer", "../../module/questionV3/ui/routes/AnswerQuestion.tsx"),
  route("/questionV3/:id/followUp", "../../module/questionV3/ui/routes/FollowUpQuestion.tsx"),
  route("/questionV3/add", "../../module/questionV3/ui/routes/AddQuestion.tsx"),
  route("/questionV3/:id/edit", "../../module/questionV3/ui/routes/EditQuestion.tsx"),
  route("/questionV3/:id/share", "../../module/questionV3/ui/routes/ShareQuestion.tsx"),
];
export const publicRoutes = [];

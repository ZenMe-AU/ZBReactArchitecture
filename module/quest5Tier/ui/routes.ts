import type { RouteConfig } from "@react-router/dev/routes";
import { route, index, layout } from "@react-router/dev/routes";

export const protectedRoutes = [
  route("quest5Tier", "../../module/quest5Tier/ui/routes/QuestionCombinationList.tsx"),
  route("/quest5Tier/:id", "../../module/quest5Tier/ui/routes/QuestionDetail.tsx"),
  route("/quest5Tier/:id/add", "../../module/quest5Tier/ui/routes/QuestionDetailAdd.tsx"),
  route("/quest5Tier/:id/answer", "../../module/quest5Tier/ui/routes/AnswerQuestion.tsx"),
  route("/quest5Tier/:id/followUp", "../../module/quest5Tier/ui/routes/FollowUpQuestion.tsx"),
  route("/quest5Tier/add", "../../module/quest5Tier/ui/routes/AddQuestion.tsx"),
  route("/quest5Tier/:id/edit", "../../module/quest5Tier/ui/routes/EditQuestion.tsx"),
  route("/quest5Tier/:id/share", "../../module/quest5Tier/ui/routes/ShareQuestion.tsx"),
];
export const publicRoutes = [];

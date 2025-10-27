import type { RouteConfig } from "@react-router/dev/routes";
import { route, index, layout } from "@react-router/dev/routes";

export const protectedRoutes = [
  route("quest5TierEg", "../../module/quest5TierEg/ui/routes/QuestionCombinationList.tsx"),
  route("/quest5TierEg/:id", "../../module/quest5TierEg/ui/routes/QuestionDetail.tsx"),
  route("/quest5TierEg/:id/add", "../../module/quest5TierEg/ui/routes/QuestionDetailAdd.tsx"),
  route("/quest5TierEg/:id/answer", "../../module/quest5TierEg/ui/routes/AnswerQuestion.tsx"),
  route("/quest5TierEg/:id/followUp", "../../module/quest5TierEg/ui/routes/FollowUpQuestion.tsx"),
  route("/quest5TierEg/add", "../../module/quest5TierEg/ui/routes/AddQuestion.tsx"),
  route("/quest5TierEg/:id/edit", "../../module/quest5TierEg/ui/routes/EditQuestion.tsx"),
  route("/quest5TierEg/:id/share", "../../module/quest5TierEg/ui/routes/ShareQuestion.tsx"),
];
export const publicRoutes = [];

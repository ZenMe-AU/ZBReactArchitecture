import type { RouteConfig } from "@react-router/dev/routes";
import { route, index, layout } from "@react-router/dev/routes";

export const protectedRoutes = [
  route("question", "../../module/question/ui/routes/QuestionCombinationList.tsx"),
  route("/question/:id", "../../module/question/ui/routes/QuestionDetail.tsx"),
  route("/question/:id/add", "../../module/question/ui/routes/QuestionDetailAdd.tsx"),
  route("/question/:id/answer", "../../module/question/ui/routes/AnswerQuestion.tsx"),
  route("/question/:id/followUp", "../../module/question/ui/routes/FollowUpQuestion.tsx"),
  route("/question/add", "../../module/question/ui/routes/AddQuestion.tsx"),
  route("/question/:id/edit", "../../module/question/ui/routes/EditQuestion.tsx"),
  route("/question/:id/share", "../../module/question/ui/routes/ShareQuestion.tsx"),
];
export const publicRoutes = [];

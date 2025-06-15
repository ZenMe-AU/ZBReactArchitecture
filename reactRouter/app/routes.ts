import type { RouteConfig } from "@react-router/dev/routes";
import { route, index, layout } from "@react-router/dev/routes";

export default [
  index("./routes/HomePage.tsx"),
  route("login", "./routes/Login.tsx"),
  // route("login", "../pages/HomePage.tsx"),

  layout("./layouts/protected.tsx", [
    route("logout", "./routes/Logout.tsx"),
    // // route("question", "./routes/QuestionCombinationList.tsx"),
    // // route("/question/:id", "./routes/QuestionDetail.tsx"),
    // // route("/question/:id/add", "./routes/QuestionDetailAdd.tsx"),
    // // route("/question/:id/answer", "./routes/AnswerQuestion.tsx"),
    // // route("/question/:id/followUp", "./routes/FollowUpQuestion.tsx"),
    // // route("/question/:id/answer/:id", "./routes/AnswerQuestion.tsx"),
    // // route("/question/:id/answerList", "./routes/AnswerList.tsx"),
    // // route("/question/add", "./routes/AddQuestion.tsx"),
    // // route("/question/:id/edit", "./routes/EditQuestion.tsx"),
    // route("/question/:id/share", "./routes/ShareQuestion.tsx"),
    // // route("/sharedQuestion", "./routes/SharedQuestionList.tsx"),

    // route("question", "../pages/QuestionCombinationList.tsx"),
    // route("/question/:id", "../pages/QuestionDetail.tsx"),
    // route("/question/:id/add", "../pages/QuestionDetailAdd.tsx"),
    // route("/question/:id/answer", "../pages/AnswerQuestion.tsx"),
    // route("/question/:id/followUp", "../pages/FollowUpQuestion.tsx"),
    // // route("/question/:id/answer/:id", "../pages/AnswerQuestion.tsx"),
    // route("/question/:id/answerList", "../pages/AnswerList.tsx"),
    // route("/question/add", "../pages/AddQuestion.tsx"),
    // route("/question/:id/edit", "../pages/EditQuestion.tsx"),
    // // route("/question/:id/share", "../pages/ShareQuestion.tsx"),
    // route("/sharedQuestion", "../pages/SharedQuestionList.tsx"),
    // // route("logout", "./routes/logout.tsx"),
  ]),

  // index("./pages/HomePage.tsx"),
  // route("login", "src/pages/Login.tsx"),
  // route("*", "./pages/NotFound.tsx")
] satisfies RouteConfig;

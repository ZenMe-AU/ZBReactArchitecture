// import { AppRouter } from "@zenmechat/shared-ui/Router.tsx";
// import HomePage from "./pages/HomePage";
import QuestionCombinationList from "./pages/QuestionCombinationList";
import QuestionDetail from "./pages/QuestionDetail2";
import QuestionDetailAdd from "./pages/QuestionDetailAdd";
import AddQuestion from "./pages/AddQuestion";
import EditQuestion from "./pages/EditQuestion";
import ShareQuestion from "./pages/ShareQuestion";
import AnswerQuestion from "./pages/AnswerQuestion";
import FollowUpQuestion from "./pages/FollowUpQuestion";
import AnswerList from "./pages/AnswerList";
import SharedQuestionList from "./pages/SharedQuestionList";

export const publicRoutes = [];
export const protectedRoutes = [
  { path: "/question", element: <QuestionCombinationList /> },
  { path: "/question/:id", element: <QuestionDetail /> },
  { path: "/question/:id/add", element: <QuestionDetailAdd /> },
  { path: "/question/:id/answer", element: <AnswerQuestion /> },
  { path: "/question/:id/followUp", element: <FollowUpQuestion /> },
  { path: "/question/:id/answer/:id", element: <AnswerQuestion /> },
  { path: "/question/:id/answerList", element: <AnswerList /> },
  { path: "/question/add", element: <AddQuestion /> },
  { path: "/question/:id/edit", element: <EditQuestion /> },
  { path: "/question/:id/share", element: <ShareQuestion /> },
  { path: "/sharedQuestion", element: <SharedQuestionList /> },
];

// export default function Router() {
//   return <AppRouter publicRoutes={publicRoutes} protectedRoutes={protectedRoutes} />;
// }

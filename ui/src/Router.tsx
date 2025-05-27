// src/App.tsx
import { unstable_HistoryRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { browserHistory } from "./applicationInsights";

import Location from "./App";
import HomePage from "./pages/HomePage";
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
import Login from "./pages/Login";

const protectedRoutes = [
  { path: "/*", element: <HomePage /> },
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

function App() {
  return (
    <Router history={browserHistory}>
      <AuthProvider>
        <Routes>
          <Route path="/location" element={<Location />} />
          <Route path="/login" element={<Login />} />
          {protectedRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={<ProtectedRoute element={route.element} />} />
          ))}
          {/* <Route path="/question" element={<QuestionList />} />
        <Route path="/question/:id" element={<QuestionDetail />} />
        <Route path="/question/:id/answer" element={<AnswerQuestion />} />
        <Route path="/question/add" element={<AddQuestion />} />
        <Route path="/question/:id/edit" element={<EditQuestion />} />
        <Route path="/question/:id/share" element={<ShareQuestion />} />
        <Route path="/sharedQuestion" element={<SharedQuestionList />} /> */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

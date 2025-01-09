// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Location from "./App";
import QuestionList from "./pages/QuestionList";
import QuestionDetail from "./pages/QuestionDetail2";
import AddQuestion from "./pages/AddQuestion";
import EditQuestion from "./pages/EditQuestion";
import ShareQuestion from "./pages/ShareQuestion";
import AnswerQuestion from "./pages/AnswerQuestion";
import SharedQuestionList from "./pages/SharedQuestionList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Location />} />

        <Route path="/question" element={<QuestionList />} />
        <Route path="/question/:id" element={<QuestionDetail />} />
        <Route path="/question/:id/answer" element={<AnswerQuestion />} />
        <Route path="/question/add" element={<AddQuestion />} />
        <Route path="/question/:id/edit" element={<EditQuestion />} />
        <Route path="/question/:id/share" element={<ShareQuestion />} />
        <Route path="/sharedQuestion" element={<SharedQuestionList />} />
      </Routes>
    </Router>
  );
}

export default App;

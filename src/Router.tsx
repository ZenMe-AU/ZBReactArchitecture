// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Location from "./App";
import QuestionList from "./pages/QuestionList";
import QuestionDetail from "./pages/QuestionDetail";
import AddQuestion from "./pages/AddQuestion";
import EditQuestion from "./pages/EditQuestion";
// import ShareQuestion from "./pages/ShareQuestion";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Location />} />

        <Route path="/question" element={<QuestionList />} />
        <Route path="/question/:id" element={<QuestionDetail />} />
        <Route path="/question/add" element={<AddQuestion />} />
        <Route path="/question/:id/edit" element={<EditQuestion />} />
        {/* <Route path="/share/:id" element={<ShareQuestion />} /> */}
      </Routes>
    </Router>
  );
}

export default App;

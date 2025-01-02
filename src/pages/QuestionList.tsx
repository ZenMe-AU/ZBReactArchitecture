import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getQuestionsByUser } from "../api/question";

function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const profileId = "1007"; // Replace with actual user ID

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestionsByUser();
        setQuestions(data); // Set fetched questions to state
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false); // Set loading to false after the request is done
      }
    };
    fetchQuestions();
  }, [profileId]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Question List</h1>
      <ul>
        {questions.map((q) => (
          <li key={q.id}>
            <Link to={`/question/${q.id}`}>{q.title}</Link>
          </li>
        ))}
      </ul>
      <Link to="/question/add">+Add Question</Link>
    </div>
  );
}

export default QuestionList;

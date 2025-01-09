import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSharedQuestionList } from "../api/question";

function SharedQuestions() {
  const [sharedQuestions, setSharedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedQuestions = async () => {
      try {
        setLoading(true);
        const result = await getSharedQuestionList();
        setSharedQuestions(result || []);
      } catch (err) {
        console.error("Error fetching shared questions:", err);
        setError("Failed to fetch shared questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedQuestions();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Shared Questions</h1>
      {sharedQuestions.length > 0 ? (
        <ul>
          {sharedQuestions.map((shared) => (
            <li key={shared.questionId}>
              <h2>{shared.question.title}</h2>
              <p>{shared.question.questionText}</p>
              <Link to={`/question/${shared.questionId}/answer`}>Answer this question</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No shared questions available.</p>
      )}
      <Link to={`/question`}>Question List</Link>
    </div>
  );
}

export default SharedQuestions;

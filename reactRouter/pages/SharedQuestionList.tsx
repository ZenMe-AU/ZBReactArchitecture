import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
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
      <Helmet>
        <title>Shared Question List</title>
      </Helmet>
      <h1>Shared Questions</h1>
      {sharedQuestions.length > 0 ? (
        <ul>
          {sharedQuestions.map((shared) => (
            <li key={shared.newQuestionId}>
              <h2>{shared.question.title}</h2>
              <p>{shared.question.questionText}</p>
              <Link to={`/question/${shared.newQuestionId}/answer`}>Answer this question</Link>
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

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getQuestionById } from "../api/question";

function QuestionDetail() {
  const { id } = useParams(); // Retrieve 'id' parameter from the URL
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const data = await getQuestionById(id);
        setQuestion(data);
      } catch (error) {
        console.error("Error fetching question:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [id]); // Re-run this effect if the 'id' changes

  if (loading) return <p>Loading...</p>;
  if (!question) return <p>Question not found</p>; // Show if question not found

  return (
    <div>
      <h1>{question.title}</h1>
      <p>{question.questionText}</p>
      {Array.isArray(question.option) &&
        question.option.map((opt, index) => (
          <li key={index}>{opt}</li> // Render each option in a list
        ))}
      <Link to="/question">Back to Question List</Link> {/* Link to navigate back */}
      <Link to={`/question/${question.id}/edit`}>Edit</Link>
    </div>
  );
}

export default QuestionDetail;

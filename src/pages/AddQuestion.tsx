import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createQuestion } from "../api/question"; 

function AddQuestion() {
  const [title, setTitle] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent default form submission behavior
    try {
      setSubmitting(true);
      const id = await createQuestion(title, questionText);
      navigate(`/question/${id}`);  // Redirect to the question detail page after successful submission
    } catch (error) {
      console.error("Error creating question:", error);  // Log error if any
    } 
  };

  if (submitting) return <p>Submitting...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h1>Add Question</h1>
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Question:</label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          required
        />
      </div>
      <button type="submit">Submit</button>  {/* Submit button */}
      <Link to="/question">Back to Question List</Link>
    </form>
  );
}

export default AddQuestion;

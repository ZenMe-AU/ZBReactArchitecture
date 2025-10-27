/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// src/pages/EditQuestion.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Helmet } from "react-helmet";
import { getQuestionById, updateQuestion } from "../api/question";
import type { Question } from "../types/interfaces";

function EditQuestion() {
  const { id } = useParams<{ id: string }>(); // Retrieve question ID from the URL
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question>({
    id: "",
    title: "",
    questionText: "",
    option: null,
    profileId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Fetch the question details for editing
    const fetchQuestion = async () => {
      try {
        if (!id) return;
        const data = await getQuestionById(id);
        setQuestion(data);
      } catch (error) {
        console.error("Error fetching question:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [id]);

  const handleInputChange = (field: keyof Question, value: string) => {
    setQuestion({ ...question, [field]: value });
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...(question.option || [])];
    updatedOptions[index] = value;
    setQuestion({ ...question, option: updatedOptions });
  };

  const handleAddOption = () => {
    setQuestion({ ...question, option: [...(question.option || []), ""] });
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = question.option ? question.option.filter((_, i) => i !== index) : null;
    setQuestion({ ...question, option: updatedOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (id) {
        console.log("Question question:", question);
        // await updateQuestion(id, question);
      } else {
        console.error("Question ID is undefined");
      }
      navigate(`/quest5Tier/${id}`);
    } catch (err) {
      console.error("Error updating question:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading question details.</p>;
  if (submitting) return <p>Submitting...</p>;

  return (
    <div>
      <Helmet>
        <title>Edit Question</title>
      </Helmet>
      <h1>Edit Question</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input id="title" type="text" value={question.title} onChange={(e) => handleInputChange("title", e.target.value)} />
        </div>
        <div>
          <label htmlFor="questionText">Question</label>
          <textarea id="questionText" value={question.questionText} onChange={(e) => handleInputChange("questionText", e.target.value)}></textarea>
        </div>
        <div>
          <label>Options</label>
          {Array.isArray(question.option) &&
            question.option.map((opt, index) => (
              <div key={index}>
                <input type="text" value={opt} onChange={(e) => handleOptionChange(index, e.target.value)} />
                <button type="button" onClick={() => handleRemoveOption(index)} disabled={!question.option || question.option.length <= 1}>
                  Remove
                </button>
              </div>
            ))}
          <button type="button" onClick={handleAddOption}>
            Add Option
          </button>
        </div>
        <button type="submit">Save Changes</button>
      </form>

      <Link to={`/quest5Tier/${question.id}`}>Back</Link>
    </div>
  );
}

export default EditQuestion;

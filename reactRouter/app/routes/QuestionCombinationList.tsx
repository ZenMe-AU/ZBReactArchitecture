import { redirect } from "react-router";
import { useNavigate, useLocation } from "react-router";
import type { Question } from "../../types/interfaces";
import { getQuestionsByUser } from "../../api/question";
import { setOperationId, logEvent } from "../../monitor/telemetry";
import type { Route } from "./routes/+types/QuestionCombinationList";
import { Helmet } from "react-helmet";

export async function clientLoader() {
  const profileId = localStorage.getItem("profileId");
  if (!profileId) {
    return redirect("/logout");
  }

  try {
    const questions: Question[] = await getQuestionsByUser();
    return { questions, profileId };
  } catch (error) {
    console.error("Error fetching questions:", error);
    return { error: "Failed to load questions.", status: 500, questions: [] };
  }
}

export default function QuestionList({ loaderData }: Route.ComponentProps) {
  const { questions, profileId } = loaderData;
  console.log("QuestionList loaderData:", loaderData);
  const navigate = useNavigate();

  const handleBackClick = () => {
    // const correlationId = setOperationId();
    // console.log("Correlation ID:", correlationId);
    // logEvent("btnNavigateBackClick", { parentId: "BackButton" });
    navigate(-1);
  };

  const handleOpenAnswer = (questionId: string) => {
    // const correlationId = setOperationId();
    // console.log("Correlation ID:", correlationId);
    // logEvent("btnAnswerDetailClick", { questionId, parentId: "QuestionList" });
    navigate(`/question/${questionId}/answer`);
  };

  const handleEditQuestion = (questionId: string, isNew: boolean) => {
    // const correlationId = setOperationId();
    // console.log("Correlation ID:", correlationId);
    // logEvent(isNew ? "bntAddQuestionClick" : "btnEditQuestionClick", { questionId, parentId: "QuestionList" });
    navigate(`/question/${questionId}${isNew ? "/add" : ""}`);
  };

  const handleShareQuestion = (questionId: string) => {
    // const correlationId = setOperationId();
    // console.log("Correlation ID:", correlationId);
    // logEvent("btnShareQuestionClick", { questionId, parentId: "QuestionList" });
    navigate(`/question/${questionId}/share`);
  };

  const handleAddQuestion = () => {
    // const correlationId = setOperationId();
    // console.log("Correlation ID:", correlationId);
    // logEvent("btnAddQuestionClick", { parentId: "ActionButton" });
    navigate(`/question/add`);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "1rem" }}>
      <Helmet>
        <title>Question List</title>
      </Helmet>
      <h1>Question List</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {questions.map((q) => (
          <li key={q.id} style={{ borderBottom: "1px solid #ccc", padding: "1rem 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => handleOpenAnswer(q.id)}>
                {q.title}
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => handleEditQuestion(q.id, q.profileId !== profileId)}>Edit</button>
                <button onClick={() => handleShareQuestion(q.id)}>Share</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between" }}>
        <button onClick={handleAddQuestion}>+ Add Question</button>
        <button onClick={handleBackClick}>Back</button>
      </div>
    </div>
  );
}

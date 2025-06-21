import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { getQuestionsByUser } from "../api/question";
import { Container, Typography, List, ListItem, ListItemButton, ListItemText, Button, Box, Divider } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ShareIcon from "@mui/icons-material/Share";
import { Question } from "../types/interfaces";
import { logEvent, setOperationId } from "@zenmechat/shared-ui/monitor/telemetry.ts";

function QuestionCombinationList() {
  const profileId = localStorage.getItem("profileId");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestionsByUser();
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [profileId]);

  const handleBackClick = () => {
    const correlationId = setOperationId();
    console.log("Correlation ID:", correlationId);
    logEvent("btnNavigateBackClick", {
      parentId: "BackButton",
    });

    navigate(-1);
  };

  const handleOpenAnswer = (questionId: string) => {
    const correlationId = setOperationId();
    console.log("Correlation ID:", correlationId);
    logEvent("btnAnswerDetailClick", {
      questionId,
      parentId: "QuestionList",
    });
  };
  const handleEditQuestion = (questionId: string, isNew: boolean) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const correlationId = setOperationId();
    console.log("Correlation ID:", correlationId);
    logEvent(isNew ? "bntAddQuestionClick" : "btnEditQuestionClick", {
      questionId,
      parentId: "QuestionList",
    });
  };
  const handleShareQuestion = (questionId: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const correlationId = setOperationId();
    console.log("Correlation ID:", correlationId);
    logEvent("btnShareQuestionClick", {
      questionId,
      parentId: "QuestionList",
    });
  };
  const handleAddQuestion = () => {
    const correlationId = setOperationId();
    console.log("Correlation ID:", correlationId);
    logEvent("btnAddQuestionClick", {
      parentId: "ActionButton",
    });
  };
  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Helmet>
        <title>Question List</title>
      </Helmet>
      <Typography variant="h4" gutterBottom>
        Question List
      </Typography>
      <List>
        {questions.map((q, index) => (
          <div key={q.id}>
            <ListItem disablePadding>
              <ListItemButton component={Link} to={`/question/${q.id}/answer`} onClick={() => handleOpenAnswer(q.id)}>
                <ListItemText primary={q.title} />
                <Box display="flex" gap={1} ml={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    component={Link}
                    to={`/question/${q.id}` + (q.profileId !== profileId ? "/add" : "")}
                    onClick={() => handleEditQuestion(q.id, q.profileId !== profileId)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ShareIcon />}
                    component={Link}
                    to={`/question/${q.id}/share`}
                    onClick={() => handleShareQuestion(q.id)}
                  >
                    Share
                  </Button>
                </Box>
              </ListItemButton>
            </ListItem>
            {index < questions.length - 1 && <Divider sx={{ bgcolor: "grey.800" }} />}
          </div>
        ))}
      </List>
      <Box mt={4} display="flex" justifyContent="space-between">
        <Button variant="contained" color="primary" component={Link} to="/question/add" onClick={() => handleAddQuestion}>
          + Add Question
        </Button>
      </Box>
    </Container>
  );
}

export default QuestionCombinationList;

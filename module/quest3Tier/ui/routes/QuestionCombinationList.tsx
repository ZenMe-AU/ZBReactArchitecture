/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Helmet } from "react-helmet";
import { Link } from "react-router";
import { getQuestionsByUser } from "../api/question";
import { Container, Typography, List, ListItem, ListItemButton, ListItemText, Button, Box, Divider } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ShareIcon from "@mui/icons-material/Share";
import type { Question } from "../types/interfaces";
import { logEvent, setOperationId } from "@zenmechat/shared-ui/monitor/telemetry";
import { Suspense } from "react";
import { Await } from "react-router";
import { Skeleton } from "@mui/material";

export async function clientLoader() {
  return { questions: getQuestionsByUser(), profileId: localStorage.getItem("profileId") };
}

export default function QuestionCombinationList({ loaderData }: { loaderData: any }) {
  const { questions, profileId } = loaderData;
  const handleOpenAnswer = (questionId: string) => {
    const correlationId = setOperationId();
    logEvent("btnAnswerDetailClick", {
      questionId,
      parentId: "QuestionList",
    });
  };
  const handleEditQuestion = (questionId: string, isNew: boolean) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const correlationId = setOperationId();
    logEvent(isNew ? "bntAddQuestionClick" : "btnEditQuestionClick", {
      questionId,
      parentId: "QuestionList",
    });
  };
  const handleShareQuestion = (questionId: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const correlationId = setOperationId();
    logEvent("btnShareQuestionClick", {
      questionId,
      parentId: "QuestionList",
    });
  };
  const handleAddQuestion = () => {
    const correlationId = setOperationId();
    logEvent("btnAddQuestionClick", {
      parentId: "ActionButton",
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Helmet>
        <title>Question List</title>
      </Helmet>
      <Typography variant="h4" gutterBottom>
        Question List
      </Typography>
      <Suspense fallback={<QuestionListSkeleton />}>
        <Await resolve={questions}>
          {(resolvedQuestions: Question[]) => (
            <>
              <List>
                {resolvedQuestions.map((q: Question, index: number) => (
                  <div key={q.id}>
                    <ListItem disablePadding>
                      <ListItemButton component={Link} to={`/quest3Tier/${q.id}/answer`} onClick={() => handleOpenAnswer(q.id)}>
                        <ListItemText primary={q.title} />
                        <Box display="flex" gap={1} ml={2}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            component={Link}
                            to={`/quest3Tier/${q.id}` + (q.profileId !== profileId ? "/add" : "")}
                            onClick={() => handleEditQuestion(q.id, q.profileId !== profileId)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ShareIcon />}
                            component={Link}
                            to={`/quest3Tier/${q.id}/share`}
                            onClick={() => handleShareQuestion(q.id)}
                          >
                            Share
                          </Button>
                        </Box>
                      </ListItemButton>
                    </ListItem>
                    {index < resolvedQuestions.length - 1 && <Divider sx={{ bgcolor: "grey.800" }} />}
                  </div>
                ))}
              </List>
            </>
          )}
        </Await>
      </Suspense>
      <Box mt={4} display="flex" justifyContent="space-between">
        <Button variant="contained" color="primary" component={Link} to="/quest3Tier/add" onClick={() => handleAddQuestion}>
          + Add Question
        </Button>
      </Box>
    </Container>
  );
}

function QuestionListSkeleton() {
  return (
    <List>
      {Array.from({ length: 3 }).map((_, i) => (
        <Box key={i} mb={2}>
          {/* <Skeleton variant="text" width="60%" height={32} /> */}
          <Skeleton variant="rectangular" height={40} />
        </Box>
      ))}
    </List>
  );
}

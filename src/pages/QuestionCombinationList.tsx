import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getQuestionsByUser } from "../api/question";
import { Container, Typography, List, ListItem, ListItemButton, ListItemText, Button, Box, IconButton, Divider } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ShareIcon from "@mui/icons-material/Share";

function QuestionCombinationList() {
  const profileId = localStorage.getItem("profileId");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(profileId);
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
  }, []);

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Question List
      </Typography>
      <List>
        {questions.map((q, index) => (
          <>
            <ListItem key={q.id} disablePadding>
              <ListItemButton component={Link} to={`/question/${q.id}/answer`}>
                <ListItemText primary={q.title} />
                <Box display="flex" gap={1} ml={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    component={Link}
                    to={`/question/${q.id}` + (q.profileId != profileId ? "/add" : "")}
                  >
                    Edit
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<ShareIcon />} component={Link} to={`/question/${q.id}/share`}>
                    Share
                  </Button>
                </Box>
              </ListItemButton>
            </ListItem>
            {index < questions.length - 1 && <Divider sx={{ bgcolor: "grey.800" }} />}
          </>
        ))}
      </List>
      <Box mt={4} display="flex" justifyContent="space-between">
        <Button variant="contained" color="primary" component={Link} to="/question/add">
          + Add Question
        </Button>
      </Box>
    </Container>
  );
}

export default QuestionCombinationList;

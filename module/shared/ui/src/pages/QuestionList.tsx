import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getQuestionsByUser } from "../api/question";
import { Container, Typography, List, ListItem, ListItemButton, ListItemText, Button, Box, IconButton } from "@mui/material";

function QuestionList() {
  const [questions, setQuestions] = useState([]);
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
  }, []);

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <>
      <Helmet>
        <title>Question List</title>
      </Helmet>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Question List
        </Typography>
        <List>
          {questions.map((q) => (
            <ListItem key={q.id} disablePadding>
              <ListItemButton component={Link} to={`/question/${q.id}/answer`}>
                <ListItemText primary={q.title} />
              </ListItemButton>
              <Box display="flex" gap={1} ml={2}>
                <Button variant="outlined" size="small" component={Link} to={`/question/${q.id}`}>
                  Edit
                </Button>
                <Button variant="outlined" size="small" component={Link} to={`/question/${q.id}/share`}>
                  Share
                </Button>
                <Button variant="outlined" size="small" component={Link} to={`/question/${q.id}/answerList`}>
                  View Answers
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>
        <Box mt={4} display="flex" justifyContent="space-between">
          <Button variant="contained" color="primary" component={Link} to="/question/add">
            + Add Question
          </Button>
          <Button variant="outlined" color="secondary" component={Link} to="/sharedQuestion">
            Shared Question List
          </Button>
        </Box>
      </Container>
    </>
  );
}
// return (
//   <div>
//     <h1>Question List</h1>
//     <ul>
//       {questions.map((q) => (
//         <li key={q.id}>
//           <Link to={`/question/${q.id}`}>{q.title}</Link>
//         </li>
//       ))}
//     </ul>
//     <Link to="/question/add">+Add Question</Link>
//     <Link to="/sharedQuestion">Shared Question List</Link>
//   </div>
// );

export default QuestionList;

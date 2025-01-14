import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getAnswerListByQuestionId } from "../api/question";
import { Container, Typography, List, ListItem, ListItemText, Box, Button, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function AnswerList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const data = await getAnswerListByQuestionId(id);
        setAnswers(data);
      } catch (error) {
        console.error("Error fetching answers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnswers();
  }, [id]);

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom>
          Answer List
        </Typography>
      </Box>
      <List>
        {answers.length > 0 ? (
          answers.map((answer) => (
            <ListItem key={answer.id} disablePadding component={Link} to={`/question/${answer.questionId}/answer/${answer.id}`}>
              <ListItemText primary={answer.answerText || answer.optionId} secondary={`By: ${answer.profileId}`} />
            </ListItem>
          ))
        ) : (
          <Typography>No answers </Typography>
        )}
      </List>
      {/* <Box mt={4}>
        <Button variant="outlined" component={Link} to={`/question/${id}/answer`}>
          Add Answer
        </Button>
      </Box> */}
    </Container>
  );
}

export default AnswerList;

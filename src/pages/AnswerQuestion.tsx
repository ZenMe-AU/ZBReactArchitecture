import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuestionById, submitAnswer } from "../api/question";
import { Question } from "../types/interfaces";
import {
  Container,
  Typography,
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function AnswerQuestion() {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const fetchedQuestion = await getQuestionById(id);
        setQuestion(fetchedQuestion);
        setStartTime(performance.now());
      } catch (err) {
        console.error("Error fetching question:", err);
        setError("Failed to load the question.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !question) {
      alert("Invalid question ID.");
      return;
    }

    const endTime = performance.now();
    const answerDuration = Math.round(endTime - startTime);

    const answerPayload = {
      option: question?.option && question.option.length > 0 ? selectedOption : null,
      answerText: question?.option && question.option.length > 0 ? null : textAnswer,
      answerDuration,
    };

    if (!answerPayload.option && !answerPayload.answerText) {
      alert("Please provide an answer.");
      return;
    }

    try {
      await submitAnswer(id, answerPayload, question.questionText);
      alert("Answer submitted successfully!");
      navigate(`/question/${id}`);
    } catch (err) {
      console.error("Error submitting answer:", err);
      alert("Failed to submit the answer.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!question) return <p>No question found.</p>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Answer Question</Typography>
      </Box>

      <Typography variant="h5" gutterBottom>
        {question.title}
      </Typography>
      <Typography variant="body1" paragraph>
        {question.questionText}
      </Typography>

      <form onSubmit={handleSubmit}>
        {question.option && question.option.length > 0 ? (
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">Options</FormLabel>
            <RadioGroup name="answer" value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
              {question.option.map((option, index) => (
                <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
              ))}
            </RadioGroup>
          </FormControl>
        ) : (
          <TextField
            label="Your Answer"
            multiline
            rows={4}
            fullWidth
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Type your answer here"
            required
            sx={{ mb: 2 }}
          />
        )}
        <Box display="flex" justifyContent="center">
          <Button type="submit" variant="contained" color="primary">
            Submit Answer
          </Button>
        </Box>
      </form>
    </Container>
  );
}
// return (
//   <div>
//     <h1>Answer Question</h1>
//     <h2>{question.title}</h2>
//     <p>{question.questionText}</p>

//     <form onSubmit={handleSubmit}>
//       {question.option && question.option.length > 0 ? (
//         // Render options as radio buttons if available
//         <ul>
//           {question.option.map((option, index) => (
//             <li key={index}>
//               <label>
//                 <input type="radio" name="answer" value={option} checked={selectedOption === option} onChange={() => setSelectedOption(option)} />
//                 {option}
//               </label>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         // Render a text input if no options are available
//         <div>
//           <label>Your Answer:</label>
//           <textarea value={textAnswer} onChange={(e) => setTextAnswer(e.target.value)} placeholder="Type your answer here" required />
//         </div>
//       )}
//       <button type="submit">Submit Answer</button>
//     </form>
//     <Link to="/sharedQuestion">Back to Shared Question</Link>
//   </div>
// );
// }

export default AnswerQuestion;

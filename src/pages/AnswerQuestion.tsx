import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getQuestionById, submitAnswer, getAnswerListByQuestionId } from "../api/question";
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
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function AnswerQuestion() {
  const profileId = localStorage.getItem("profileId");
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const [prevAns, setPrevAns] = useState({});
  const [answerList, setAnswerList] = useState([]);
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

    const fetchAnswers = async () => {
      try {
        const data = await getAnswerListByQuestionId(id);
        console.log(data);
        const answerList = data.reduce(
          (acc, q) => {
            if (q.profileId == profileId) {
              acc.self.push(q);
            } else {
              acc.others.push(q);
            }
            return acc;
          },
          { self: [], others: [] }
        );
        console.log(answerList);

        setAnswerList(answerList.others);
        if (answerList.self.length > 0) {
          setPrevAns(answerList.self[0]);
          setSelectedOption(answerList.self[0].optionId);
          setTextAnswer(answerList.self[0].answerText);
        }
      } catch (error) {
        console.error("Error fetching answers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnswers();
    console.log(answerList);
    console.log(prevAns);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (!id || !question) {
      alert("Invalid question ID.");
      setSubmitting(false);
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
      setSubmitting(false);
      return;
    }

    if (answerPayload.option == prevAns.optionId && answerPayload.answerText == prevAns.answerText) {
      console.log("nothing changed!");
      setSubmitting(false);
      return;
    }

    try {
      await submitAnswer(id, answerPayload, question.questionText);
      alert("Answer submitted successfully!");
      setPrevAns((prev) => ({
        ...prev,
        optionId: answerPayload.option,
        answerText: answerPayload.answerText,
      }));
      // navigate(`/question/${id}`);
    } catch (err) {
      console.error("Error submitting answer:", err);
      alert("Failed to submit the answer.");
    } finally {
      setSubmitting(false);
      setStartTime(performance.now());
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
        <Typography variant="h4">{question.title}</Typography>
      </Box>
      {/* <Typography variant="h5" gutterBottom>
        {question.title}
      </Typography> */}
      <Typography variant="body1" paragraph>
        {question.questionText}
      </Typography>

      <form onSubmit={handleSubmit}>
        {question.option && question.option.length > 0 ? (
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">choose your answer</FormLabel>
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
          <Button type="submit" variant="contained" color="primary" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Answer"}
          </Button>
        </Box>
      </form>
      {answerList.length > 0 && (
        <Box display="flex" alignItems="center" mt={3}>
          <Typography variant="h8" gutterBottom>
            Others Answer:
          </Typography>
        </Box>
      )}
      <List>
        {answerList.length > 0 &&
          answerList.map((answer) => (
            <ListItem key={answer.id} disablePadding>
              <ListItemText primary={answer.answerText || answer.optionId} secondary={`By: ${answer.profileId}`} />
            </ListItem>
          ))}
      </List>
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

import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import { getQuestionById, getQuestionsByUser, getAnswerListByQuestionId, sendFollowUpQuestion } from "../api/question";
import { Question, Answer } from "../types/interfaces";
import {
  Container,
  Box,
  IconButton,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Card,
  CardContent,
  MenuItem,
  Select,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";

function FollowUpQuestion() {
  const profileId = localStorage.getItem("profileId");
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [questionList, setQuestionList] = useState<Question[]>([]);
  const [answerCount, setAnswerCount] = useState<Record<string, number>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [optionList, setOptionList] = useState([]);

  const [saveFilter, setSaveFilter] = useState<boolean>(false);
  const [cards, setCards] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [cardErrors, setCardErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // 新增卡片
  const handleAddCard = () => {
    const newCardId = `card-${cards.length + 1}`;
    setCards([...cards, newCardId]);
    setSelectedQuestions({ ...selectedQuestions, [newCardId]: "" });
    setSelectedOptions({ ...selectedOptions, [newCardId]: [] });
  };

  // 刪除卡片
  const handleRemoveCard = (cardId) => {
    setCards(cards.filter((id) => id !== cardId));
    const updatedQuestions = { ...selectedQuestions };
    const updatedOptions = { ...selectedOptions };
    delete updatedQuestions[cardId];
    delete updatedOptions[cardId];
    setSelectedQuestions(updatedQuestions);
    setSelectedOptions(updatedOptions);
  };

  const handleQuestionChange = (cardId, questionId) => {
    setSelectedQuestions((prev) => ({ ...prev, [cardId]: questionId }));

    if (cardId in cardErrors && questionId) {
      setCardErrors((prev) => {
        const updatedErrors = { ...prev };
        updatedErrors[cardId].question = false;
        !Object.values(updatedErrors[cardId]).includes(true) && delete updatedErrors[cardId];
        return updatedErrors;
      });
    }
    console.log("Selected Question:", selectedQuestions);
  };

  const handleOptionChange = (cardId, option) => {
    setSelectedOptions((prev) => {
      const cardOptions = prev[cardId] || [];
      const updatedOptions = cardOptions.includes(option) ? cardOptions.filter((item) => item !== option) : [...cardOptions, option];

      if (cardId in cardErrors && cardErrors[cardId]?.option && updatedOptions.length > 0) {
        setCardErrors((prev) => {
          const updatedErrors = { ...prev };
          updatedErrors[cardId].option = false;
          !Object.values(updatedErrors[cardId]).includes(true) && delete updatedErrors[cardId];
          return updatedErrors;
        });
      }

      return { ...prev, [cardId]: updatedOptions };
    });
  };

  const handleFollowUp = async () => {
    if (!id) return;
    let hasError = false;
    const newErrors = {};

    for (const cardId of cards) {
      const questionId = selectedQuestions[cardId];
      const options = selectedOptions[cardId] || [];

      if (!questionId || options.length === 0) {
        newErrors[cardId] = {
          question: !questionId,
          option: options.length === 0,
        };
        hasError = true;
      }
    }

    setCardErrors(newErrors);

    if (hasError) {
      console.log("hasError", newErrors);

      return;
    }
    const followUpData = cards.map((cardId) => ({
      question_id: selectedQuestions[cardId],
      option: selectedOptions[cardId] || [],
    }));

    try {
      setSubmitting(true);
      const response = await sendFollowUpQuestion(id, followUpData, saveFilter);
      console.log("Response:", response);
      // navigate(`/question/${id}`, { replace: true });
    } catch (error) {
      console.error("Error send follow up question:", error); // Log error if any
    } finally {
      setSubmitting(false);
    }
    console.log("Follow-up Data:", JSON.stringify(followUpData, null, 2));
    console.log("Follow-up Data:", followUpData);
  };

  useEffect(() => {
    if (!id) return;

    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const fetchedQuestion = await getQuestionById(id);
        if (fetchedQuestion.option === null) {
          console.log("not an option");
        }
        setQuestion(fetchedQuestion);
        setOptionList(fetchedQuestion.option);
      } catch (err) {
        console.error("Error fetching question:", err);
        setError("Failed to load the question.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();

    const fetchQuestions = async () => {
      try {
        const data = await getQuestionsByUser();
        let list = data.filter((q: Question) => q.id != id);
        console.log("List:", list);
        setQuestionList(list);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();

    const fetchAnswers = async () => {
      try {
        const data = await getAnswerListByQuestionId(id);
        const count = data.reduce((acc: Record<string, number>, item: Answer) => {
          if (item.profileId !== profileId) {
            if (item.optionId) {
              acc[item.optionId] = (acc[item.optionId] || 0) + 1;
            }
          }
          return acc;
        }, {});

        setAnswerCount(count);
        console.log("Answer Count:", count);
      } catch (error) {
        console.error("Error fetching answers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnswers();
  }, [id]);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Send a follow-up Question</Typography>
      </Box>
      <Typography>Select who you want to send a follow-up question to</Typography>

      {cards.map((cardId) => (
        <Card
          key={cardId}
          sx={{
            mb: 2,
            width: "80%",
            mx: "auto",
            borderRadius: "12px",
            boxShadow: cardErrors[cardId] ? "0px 0px 10px red" : "3px 3px 10px rgba(0,0,0,0.2)",
          }}
          variant="outlined"
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Follow-Up Question</Typography>
              <IconButton onClick={() => handleRemoveCard(cardId)} color="error">
                <ClearIcon />
              </IconButton>
            </Box>

            <Select
              value={selectedQuestions[cardId] || ""}
              onChange={(e) => handleQuestionChange(cardId, e.target.value)}
              displayEmpty
              fullWidth
              sx={{ mb: 2, border: cardErrors[cardId]?.question ? "2px solid red" : "none" }}
              error={cardErrors[cardId]?.question}
            >
              <MenuItem value="" disabled>
                Select a question
              </MenuItem>
              {questionList.map((question, index) => (
                <MenuItem key={index} value={question.id}>
                  {question.title}
                </MenuItem>
              ))}
            </Select>

            <FormGroup>
              {optionList.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox checked={selectedOptions[cardId]?.includes(option) || false} onChange={() => handleOptionChange(cardId, option)} />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      <Typography variant="body1" sx={{ mr: 1 }}>
                        {option}
                      </Typography>
                      {answerCount[option] > 0 && (
                        <Typography variant="body2" sx={{ color: "#455a64", fontWeight: "bold" }}>
                          ({answerCount[option]} response)
                        </Typography>
                      )}
                    </Box>
                  }
                />
              ))}
            </FormGroup>

            {cardErrors[cardId]?.option && (
              <Typography variant="body2" color="error">
                At least one option must be selected.
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}

      <Box display="flex" justifyContent="center" mb={2}>
        <Button variant="text" color="primary" onClick={handleAddCard}>
          <AddIcon /> Add
        </Button>
      </Box>
      {cards.length > 0 && (
        <Box display="flex" justifyContent="center" mx={2}>
          <Button variant="contained" onClick={handleFollowUp} disabled={cards.length === 0 || submitting}>
            send
          </Button>
          <FormControlLabel
            sx={{ ml: 2 }}
            control={<Checkbox checked={saveFilter} onChange={(e) => setSaveFilter(e.target.checked)} />}
            label="Save Filter"
          />
        </Box>
      )}
    </Container>
  );
}
export default FollowUpQuestion;

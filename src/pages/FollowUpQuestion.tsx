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
  TextField,
} from "@mui/material";
import Divider from "@mui/material/Divider";
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
  const [selectedInitOptions, setSelectedInitOptions] = useState([]);

  const [followUpQuestionId, setFollowUpQuestionId] = useState<string | null>(null);

  const [cardErrors, setCardErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittingError, setSubmittingError] = useState(false);

  const handleAddCard = () => {
    const newCardId = `card-${cards.length + 1}`;
    setCards([...cards, newCardId]);
    setSelectedQuestions({ ...selectedQuestions, [newCardId]: "" });
    setSelectedOptions({ ...selectedOptions, [newCardId]: [] });
    console.log("cards", cards);
  };

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
    if (questionId === followUpQuestionId) {
      setFollowUpQuestionId(null);
    }
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

  const handleInitOptionChange = (option) => {
    setSelectedInitOptions((prev) => {
      return prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option];
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
    if (!followUpQuestionId || selectedInitOptions.length === 0) {
      hasError = true;
    }

    setCardErrors(newErrors);
    setSubmittingError(hasError);

    if (hasError) {
      console.log("hasError", newErrors);
      return;
    }

    const filterData = cards.map((cardId) => ({
      question_id: selectedQuestions[cardId],
      option: selectedOptions[cardId] || [],
    }));

    filterData.unshift({
      question_id: question.id,
      option: selectedInitOptions,
    });
    console.log("Follow-up Data:", filterData);
    // return;
    try {
      setSubmitting(true);
      const response = await sendFollowUpQuestion(id, filterData, followUpQuestionId, saveFilter);
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

  const fetchAnswers = async (questionId: string) => {
    try {
      const data = await getAnswerListByQuestionId(questionId);
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
        // setCards(["card-initial"]);
        // setSelectedQuestions({ "card-initial": fetchedQuestion.id });
        // setSelectedOptions({ "card-initial": [] });
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
        let list = data.filter((q: Question) => q.id != id && q.option !== null && q.option.length > 0);
        console.log("List:", list);
        setQuestionList(list);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();

    fetchAnswers(id);
  }, [id]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Send a follow-up Question</Typography>
      </Box>
      <Container sx={{ width: "80%", maxWidth: "lg" }}>
        <Typography>Select who you want to send a follow-up question to</Typography>

        <Card
          key="card-initial"
          sx={{
            mx: "auto",
            border: "none",
            boxShadow: "none",
          }}
        >
          <CardContent>
            <TextField
              value={question?.title || ""}
              variant="outlined"
              fullWidth
              readOnly={true}
              sx={{
                mb: 2,
                color: "text.primary",
                "& .MuiInputBase-input": {
                  color: "#000",
                  cursor: "default",
                },
              }}
            />

            <FormGroup>
              {question?.option.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={<Checkbox checked={selectedInitOptions?.includes(option) || false} onChange={() => handleInitOptionChange(option)} />}
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

            {selectedInitOptions.length === 0 && submittingError && (
              <Typography variant="body2" color="error">
                At least one option must be selected.
              </Typography>
            )}
          </CardContent>
        </Card>

        {cards.map((cardId) => (
          <>
            <Divider sx={{ backgroundColor: "#757575", my: 1 }} />
            <Card
              key={cardId}
              sx={{
                mx: "auto",
                border: "none",
                boxShadow: "none",
              }}
            >
              <CardContent sx={{ py: 0 }}>
                <Box display="flex" justifyContent="right" alignItems="center">
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
                    <MenuItem key={index} value={question.id} disabled={Object.values(selectedQuestions).includes(question.id)}>
                      {question.title}
                    </MenuItem>
                  ))}
                </Select>

                <FormGroup>
                  {(questionList.find((q) => q.id === selectedQuestions[cardId])?.option || []).map((option, index) => (
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
          </>
        ))}

        <Box display="flex" justifyContent="right" my={-2}>
          <Button variant="text" color="primary" onClick={handleAddCard}>
            <AddIcon /> Add
          </Button>
        </Box>

        <Box display="flex" justifyContent="center" my={2}>
          <Select
            variant="standard"
            sx={{ mx: 1, width: "30%" }}
            displayEmpty
            value={followUpQuestionId || ""}
            onChange={(e) => setFollowUpQuestionId(e.target.value)}
            error={submittingError && !followUpQuestionId}
            fullWidth
          >
            <MenuItem value="" disabled>
              Select a follow-up question
            </MenuItem>
            {questionList.map((question) => (
              <MenuItem key={question.id} value={question.id} disabled={Object.values(selectedQuestions).includes(question.id)}>
                {question.title}
              </MenuItem>
            ))}
          </Select>
          <Button variant="contained" onClick={handleFollowUp} sx={{ mx: 1 }} disabled={submitting}>
            send
          </Button>
          <FormControlLabel
            sx={{ mx: 1 }}
            control={<Checkbox checked={saveFilter} onChange={(e) => setSaveFilter(e.target.checked)} />}
            label="Save Filter"
          />
        </Box>
      </Container>
    </Container>
  );
}
export default FollowUpQuestion;

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { compare } from "fast-json-patch";
import { getQuestionById, createQuestion } from "../api/question";
import { Container, Typography, Box, TextField, Button, List, ListItem, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { styled } from "@mui/material/styles";

const ReadOnlyText = styled("div")(({ theme }) => ({
  display: "inline-block",
  padding: "8px 0",
  minHeight: "1.4375em",
  "&:hover": {
    cursor: "text",
  },
}));

function QuestionDetailAdd() {
  const { id } = useParams();
  const [questionData, setQuestionData] = useState(null); // Original question data
  const [editedData, setEditedData] = useState(null); // Edited data
  const [editingFields, setEditingFields] = useState({}); // Fields currently being edited
  const [isEditing, setIsEditing] = useState(false); // Whether the update/cancel buttons are visible
  const navigate = useNavigate();

  // Fetch question data by ID when component mounts
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const data = await getQuestionById(id);
        setQuestionData(data);
        setEditedData(data); // Initialize editing data
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };
    fetchQuestion();
  }, [id]);

  // Toggle edit mode for a specific field
  const toggleFieldEdit = (field) => {
    setEditingFields((prev) => ({ ...prev, [field]: true }));
  };

  // Handle changes to a specific field
  const handleFieldEdit = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
    setIsEditing(true);
  };

  // Handle blur event for a specific field
  const handleBlur = (field) => {
    setEditingFields((prev) => ({ ...prev, [field]: false }));
  };

  // Update options list
  const handleOptionsEdit = (options) => {
    handleFieldEdit("option", options);
  };

  // Update the question data using a patch API
  const handleUpdate = async () => {
    const patches = compare(questionData, editedData);
    if (patches.length > 0) {
      try {
        setIsEditing(false);
        const result = await createQuestion(editedData.title, editedData.questionText, editedData.options);
        console.log("ADD!!!!");
      } catch (error) {
        setIsEditing(true);
        console.error("Error editing question:", error);
      } finally {
        setQuestionData(editedData);
        setEditingFields({});
        navigate(`/question`);
      }
    }
  };

  // Cancel edits and revert to original data
  const handleCancel = () => {
    setEditedData(questionData);
    setEditingFields({});
    setIsEditing(false);
  };

  // Return loading indicator if data is not yet available
  if (!questionData) return <div>Loading...</div>;

  const renderField = (label, fieldName) => (
    <Box mb={3}>
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>
      <Box display="flex" alignItems="center" gap={1}>
        {editingFields[fieldName] ? (
          <TextField
            fullWidth
            value={editedData[fieldName] || ""}
            onChange={(e) => handleFieldEdit(fieldName, e.target.value)}
            onBlur={() => handleBlur(fieldName)}
            autoFocus
          />
        ) : (
          <Box display="flex" alignItems="center" width="100%">
            <ReadOnlyText onClick={() => toggleFieldEdit(fieldName)}>{editedData[fieldName]}</ReadOnlyText>
            {/* <TextField value={editedData[fieldName] || ""} onClick={() => toggleFieldEdit(fieldName)} autoFocus /> */}
            <IconButton onClick={() => toggleFieldEdit(fieldName)} size="small" sx={{ ml: 1 }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );

  const renderOptions = () => (
    <Box
      mb={3}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          handleBlur("option");
        }
      }}
    >
      <Typography variant="h6" gutterBottom>
        Options
        {!editingFields.option && (
          <IconButton onClick={() => toggleFieldEdit("option")} size="small" sx={{ ml: 1 }}>
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </Typography>
      <List>
        {editingFields.option ? (
          editedData.option?.map((option, index) => (
            <ListItem key={index}>
              <TextField
                fullWidth
                value={option}
                onChange={(e) => {
                  const updatedOptions = [...(editedData.option || [])];
                  updatedOptions[index] = e.target.value;
                  handleOptionsEdit(updatedOptions);
                }}
              />
              <Button
                onClick={() => {
                  const updatedOptions = [...(editedData.option || [])];
                  updatedOptions.splice(index, 1);
                  handleOptionsEdit(updatedOptions);
                }}
              >
                <DeleteIcon />
              </Button>
            </ListItem>
          ))
        ) : (
          <Box onClick={() => toggleFieldEdit("option")}>
            {editedData.option?.map((option, index) => (
              <ListItem key={index}>
                <ReadOnlyText>{option}</ReadOnlyText>
              </ListItem>
            ))}
          </Box>
        )}
      </List>
      {editingFields.option && (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => {
            const updatedOptions = [...(editedData.option || []), ""];
            handleOptionsEdit(updatedOptions);
          }}
        >
          Add Option
        </Button>
      )}
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Question Detail</Typography>
      </Box>
      <Box>
        {renderField("Title", "title")}
        {renderField("Question Text", "questionText")}
        {renderOptions()}
        {isEditing && (
          <Box display="flex" justifyContent="flex-end" gap={2} mb={3}>
            <Button variant="contained" color="primary" onClick={handleUpdate}>
              Create
            </Button>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default QuestionDetailAdd;

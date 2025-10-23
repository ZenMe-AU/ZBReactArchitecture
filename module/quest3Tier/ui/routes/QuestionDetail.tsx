import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Helmet } from "react-helmet";
// import { compare } from "fast-json-patch";
import { getQuestionById, updateQuestionPatch } from "../api/question";
import { Container, Typography, Box, TextField, Button, List, ListItem, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { styled } from "@mui/material/styles";
import type { Question } from "../types/interfaces";
import { logEvent, setOperationId } from "@zenmechat/shared-ui/monitor/telemetry";
import pkg from "fast-json-patch";

const { compare } = pkg;
const ReadOnlyText = styled("div")(() => ({
  display: "inline-block",
  padding: "8px 0",
  minHeight: "1.4375em",
  "&:hover": {
    cursor: "text",
  },
}));

function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const [questionData, setQuestionData] = useState<Question | null>(null); // Original question data
  const [editedData, setEditedData] = useState<Question | null>(null); // Edited data
  const [editingFields, setEditingFields] = useState<{ [key: string]: boolean }>({}); // Fields currently being edited
  const [isEditing, setIsEditing] = useState(false); // Whether the update/cancel buttons are visible
  const navigate = useNavigate();

  // Fetch question data by ID when component mounts
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const data = await getQuestionById(id!);
        setQuestionData(data);
        setEditedData(data); // Initialize editing data
        if (data.profileId !== localStorage.getItem("profileId")) {
          navigate(`/quest3Tier/${id}/add`, { replace: true });
        }
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };
    fetchQuestion();
  }, [id]);

  const handleBackClick = () => {
    const correlationId = setOperationId();
    console.log("Correlation ID:", correlationId);
    logEvent("btnNavigateBackClick", {
      parentId: "BackButton",
    });

    navigate(-1);
  };

  // Toggle edit mode for a specific field
  const toggleFieldEdit = (field: keyof Question) => {
    setEditingFields((prev) => ({ ...prev, [field]: true }));
  };

  // Handle changes to a specific field
  const handleFieldEdit = (field: keyof Question, value: any) => {
    setEditedData((prev) => ({ ...prev, [field]: value } as Question));
    setIsEditing(true);
  };

  // Handle blur event for a specific field
  const handleBlur = (field: keyof Question) => {
    setEditingFields((prev) => ({ ...prev, [field]: false }));
  };

  // Update options list
  const handleOptionsEdit = (options: string[]) => {
    handleFieldEdit("option", options);
  };

  // Update the question data using a patch API
  const handleUpdate = async () => {
    if (questionData && editedData) {
      const correlationId = setOperationId();
      console.log("Correlation ID:", correlationId);
      const patches: any = compare(questionData, editedData);
      try {
        setIsEditing(false);
        await updateQuestionPatch(id!, patches);
        console.log("Updated successfully!");
        logEvent("btnSubmitUpdateQuestionClick", {
          parentId: "SubmitButton",
          questionId: id,
        });
      } catch (error) {
        setIsEditing(true);
        console.error("Error updating question:", error);
      } finally {
        setQuestionData(editedData);
        setEditingFields({});
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

  const renderField = (label: string, fieldName: keyof Question) => (
    <Box mb={3}>
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>
      <Box display="flex" alignItems="center" gap={1}>
        {editingFields[fieldName] ? (
          <TextField
            fullWidth
            value={editedData ? editedData[fieldName] || "" : ""}
            onChange={(e) => handleFieldEdit(fieldName, e.target.value)}
            onBlur={() => handleBlur(fieldName)}
            autoFocus
          />
        ) : (
          <Box display="flex" alignItems="center" width="100%">
            <ReadOnlyText onClick={() => toggleFieldEdit(fieldName)}>{editedData ? editedData[fieldName] : ""}</ReadOnlyText>
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
          editedData?.option?.map((option, index) => (
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
            {editedData?.option?.map((option, index) => (
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
            const updatedOptions = [...(editedData?.option || []), ""];
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
      <Helmet>
        <title>Question Detail</title>
      </Helmet>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={handleBackClick}>
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
              Update
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

export default QuestionDetail;

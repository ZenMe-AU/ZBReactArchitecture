import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { compare } from "fast-json-patch";
import { getQuestionById, updateQuestionPatch } from "../api/question";
import "../Question.css";

function QuestionDetail() {
  const { id } = useParams();
  const [questionData, setQuestionData] = useState(null); // Original question data
  const [editedData, setEditedData] = useState(null); // Edited data
  const [editingFields, setEditingFields] = useState({}); // Fields currently being edited
  const [isEditing, setIsEditing] = useState(false); // Whether the update/cancel buttons are visible

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
    try {
      setIsEditing(false);
      const result = await updateQuestionPatch(id, patches);
      console.log("Updated successfully!");
    } catch (error) {
      setIsEditing(true);
      console.error("Error updating question:", error);
    } finally {
      setQuestionData(editedData);
      setEditingFields({});
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

  // Render a field with edit and view modes
  const renderField = (label: string, fieldName: string) => (
    <div className="question-item">
      <label>{label}:</label>
      <div
        className="field-container"
        onMouseEnter={() => setEditingFields((prev) => ({ ...prev, [`${fieldName}Hover`]: true }))}
        onMouseLeave={() => setEditingFields((prev) => ({ ...prev, [`${fieldName}Hover`]: false }))}
      >
        {editingFields[fieldName] ? (
          <input
            type="text"
            value={editedData[fieldName] || ""}
            onChange={(e) => handleFieldEdit(fieldName, e.target.value)}
            onBlur={() => handleBlur(fieldName)}
            autoFocus
          />
        ) : (
          <span onDoubleClick={() => toggleFieldEdit(fieldName)}>{editedData[fieldName] || `No ${label.toLowerCase()}`}</span>
        )}
        {editingFields[`${fieldName}Hover`] && !editingFields[fieldName] && <button onClick={() => toggleFieldEdit(fieldName)}>Edit</button>}
      </div>
    </div>
  );

  // Render options list with add/remove functionality
  const renderOptions = () => (
    <div className="question-item">
      <label>Options:</label>
      <div
        className="field-container"
        onMouseEnter={() => setEditingFields((prev) => ({ ...prev, optionHover: true }))}
        onMouseLeave={() => setEditingFields((prev) => ({ ...prev, optionHover: false }))}
      >
        {editingFields.option ? (
          <div
            className="options-editor"
            tabIndex={0}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                handleBlur("option");
              }
            }}
            autoFocus
          >
            {(editedData.option || []).map((option, index) => (
              <div key={index} className="option-item">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const updatedOptions = [...(editedData.option || [])];
                    updatedOptions[index] = e.target.value;
                    handleOptionsEdit(updatedOptions);
                  }}
                />
                <button
                  onClick={() => {
                    const updatedOptions = [...(editedData.option || [])];
                    updatedOptions.splice(index, 1);
                    handleOptionsEdit(updatedOptions);
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const updatedOptions = [...(editedData.option || []), ""];
                handleOptionsEdit(updatedOptions);
              }}
            >
              Add Option
            </button>
          </div>
        ) : (
          <ul onDoubleClick={() => toggleFieldEdit("option")}>
            {(editedData.option || []).map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        )}
        {editingFields.optionHover && !editingFields.option && <button onClick={() => toggleFieldEdit("option")}>Edit Options</button>}
      </div>
    </div>
  );

  return (
    <div className="question-detail">
      <h1>Question Detail</h1>
      {renderField("Title", "title")}
      {renderField("Question Text", "questionText")}
      {renderOptions()}
      {isEditing ? (
        <div className="action-buttons">
          <button className="update-button" onClick={handleUpdate}>
            Update
          </button>
          <button className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      ) : (
        <Link to="/question">Back to Question List</Link>
      )}
    </div>
  );
}

export default QuestionDetail;

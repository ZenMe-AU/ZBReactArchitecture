import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createQuestion } from "../api/question";
import { Container, Typography, Box, TextField, Button, List, ListItem, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";

function AddQuestion() {
  const [title, setTitle] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Function to add a new option to the list
  const handleAddOption = () => {
    if (newOption.trim() !== "") {
      setOptions((prev) => [...prev, newOption.trim()]);
      setNewOption(""); // Clear the input field after adding
    }
  };

  // Function to remove an option from the list
  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      setSubmitting(true);
      const id = await createQuestion(title, questionText, options);
      navigate(`/question/${id}`); // Redirect to the question detail page after successful submission
    } catch (error) {
      console.error("Error creating question:", error); // Log error if any
    }
  };

  if (submitting) return <p>Submitting...</p>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Add Question</Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Box mb={3}>
          <TextField label="Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Box>

        <Box mb={3}>
          <TextField label="Question" fullWidth multiline rows={4} value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
        </Box>

        <Box mb={3}>
          <Typography variant="h6">Options:</Typography>
          <List>
            {options.map((option, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveOption(index)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                {option}
              </ListItem>
            ))}
          </List>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              label="New Option"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Enter an option"
              sx={{ flexGrow: 1 }}
            />
            <Button variant="contained" onClick={handleAddOption}>
              Add
            </Button>
          </Box>
        </Box>

        <Box display="flex" justifyContent="flex-end" gap={2}>
          {/* <Button variant="outlined" color="secondary" component={Link} to="/question">
            Back to Question List
          </Button> */}
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </Box>
      </form>
    </Container>
  );
}
//   return (
//     <form onSubmit={handleSubmit}>
//       <h1>Add Question</h1>
//       <div>
//         <label>Title:</label>
//         <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
//       </div>
//       <div>
//         <label>Question:</label>
//         <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} required />
//       </div>
//       <div>
//         <label>Options:</label>
//         <ul>
//           {options.map((option, index) => (
//             <li key={index}>
//               {option}
//               <span> </span>
//               <button type="button" onClick={() => handleRemoveOption(index)}>
//                 Remove
//               </button>
//             </li>
//           ))}
//         </ul>
//         <input
//           type="text"
//           value={newOption}
//           onChange={(e) => setNewOption(e.target.value)} // Update newOption state on change
//           placeholder="Enter an option"
//         />
//         <button type="button" onClick={handleAddOption}>
//           Add Option
//         </button>
//       </div>
//       <button type="submit">Submit</button>
//       <Link to="/question">Back to Question List</Link>
//     </form>
//   );
// }

export default AddQuestion;

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getQuestionById, shareQuestion } from "../api/question";
import { getProfileList } from "../api/profile";
import { Profile } from "../types/interfaces";
import { Container, Typography, Box, Button, IconButton, CircularProgress, Alert, TextField } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Autocomplete from "@mui/material/Autocomplete";

function ShareQuestion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profileId, setProfileId] = useState<number | null>(null);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [selectedReceivers, setSelectedReceivers] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const profiles = await getProfileList(); // Fetch profiles using API
        setFriends(profiles);
        const questions = await getQuestionById(id);
        setProfileId(questions.profileId);
      } catch (err) {
        console.error("Error fetching profile list:", err);
        setError("Failed to fetch friends list.");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [id]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !profileId || selectedReceivers.length === 0) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call the shareQuestion API
      await shareQuestion(
        id,
        profileId,
        selectedReceivers.map(({ id }) => id)
      );
      alert("Question shared successfully!");

      navigate(`/question/${id}/answer`); // Navigate back to the question detail
    } catch (err) {
      setError("Failed to share the question. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => Number(option.value));
    setSelectedReceivers(selectedOptions);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Share Question</Typography>
      </Box>

      {error && (
        <Box mb={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <form onSubmit={handleShare}>
        <Box mb={3}>
          <Autocomplete
            multiple
            id="share-receivers"
            options={friends}
            getOptionLabel={(option) => `${option.id} - ${option.name}`}
            onChange={(_, newValue) => {
              setSelectedReceivers(newValue);
            }}
            renderInput={(params) => <TextField {...params} label="Select Friends" placeholder="Choose friends to share with" />}
            value={selectedReceivers}
            limitTags={3}
          />
        </Box>

        <Box display="flex" justifyContent="center">
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? "Sharing..." : "Share"}
          </Button>
        </Box>
      </form>
    </Container>
  );
}

//   return (
//     <div>
//       <h1>Share Question</h1>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       <form onSubmit={handleShare}>
//         <div>
//           <label htmlFor="friends">Select Friends:</label>
//           <select id="friends" multiple value={selectedReceivers} onChange={handleReceiverChange}>
//             {friends.map((friend) => (
//               <option key={friend.id} value={friend.id}>
//                 {friend.id}-{friend.name}
//               </option>
//             ))}
//           </select>
//         </div>
//         <button type="submit" disabled={loading}>
//           {loading ? "Sharing..." : "Share"}
//         </button>
//       </form>

//       <Link to={`/question/${id}`}>Back to Detail</Link>
//     </div>
//   );
// }

export default ShareQuestion;

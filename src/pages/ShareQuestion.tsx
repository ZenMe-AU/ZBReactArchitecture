import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getQuestionById, shareQuestion } from "../api/question";
import { getProfileList } from "../api/profile";
import { Profile } from "../types/interfaces";

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
      await shareQuestion(id, profileId, selectedReceivers);
      alert("Question shared successfully!");

      navigate(`/question/${id}`); // Navigate back to the question detail
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
    <div>
      <h1>Share Question</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleShare}>
        <div>
          <label htmlFor="friends">Select Friends:</label>
          <select id="friends" multiple value={selectedReceivers} onChange={handleReceiverChange}>
            {friends.map((friend) => (
              <option key={friend.id} value={friend.id}>
                {friend.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Sharing..." : "Share"}
        </button>
      </form>
    </div>
  );
}

export default ShareQuestion;

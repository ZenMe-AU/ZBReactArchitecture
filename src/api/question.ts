const apiDomain = import.meta.env.VITE_API_DOMAIN;
const profileId = "1007"; // Replace with actual user ID
const receiverId = "258";

// Fetch list of questions for a specific user
export const getQuestionsByUser = async () => {
  try {
    const response = await fetch(`${apiDomain}/api/profile/${profileId}/question`, {
      method: "GET", // HTTP method
      headers: {
        Accept: "application/json", // We expect JSON in response
        "Content-Type": "application/json", // We're sending JSON
        "Access-Control-Allow-Origin": "*", // Allow cross-origin requests (CORS)
      },
    });

    // Check if the response is okay (status code 2xx)
    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }

    // Parse the JSON response body
    const data = await response.json();
    return data.return.list;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error; // Re-throw the error to be handled in the component
  }
};

// Create a new questionnaire
export const createQuestion = async (title: string, questionText: string, option: string[]) => {
  try {
    const response = await fetch(`${apiDomain}/api/question`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile_id: profileId,
        title: title,
        question: questionText,
        option: option,
      }), // Send the request body as JSON
    });

    if (!response.ok) {
      throw new Error("Failed to create question");
    }

    const result = await response.json();
    return result.return.id;
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
};

// Get question detail
export const getQuestionById = async (id: string) => {
  try {
    const response = await fetch(`${apiDomain}/api/question/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch question details");
    }

    const data = await response.json();
    return data.return.detail;
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
};

// Update an existing question
export const updateQuestion = async (id: string, data: { title: string; questionText: string; option: string[] }) => {
  try {
    const response = await fetch(`${apiDomain}/api/question/${id}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: data.title,
        question: data.questionText,
        option: data.option,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update question");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
};

// Share a question
export const shareQuestion = async (id: string, profileId: number, receiverIds: number[]) => {
  try {
    const response = await fetch(`${apiDomain}/api/question/${id}/share`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile_id: profileId,
        receiver_ids: receiverIds,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to share question");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error sharing question:", error);
    throw error;
  }
};

export const submitAnswer = async (id: string, answerPayload: { option: string | null; answerText: string | null }, questionText: string | null) => {
  try {
    const response = await fetch(`${apiDomain}/api/question/${id}/answer`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile_id: receiverId,
        question: questionText,
        option: answerPayload.option,
        answer: answerPayload.answerText,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit answer");
    }

    // Parse the JSON response body
    const data = await response.json();
    return data.return;
  } catch (err) {
    console.error("Error submitting answer:", err);
    throw err;
  }
};

export const getSharedQuestionList = async () => {
  try {
    const response = await fetch(`${apiDomain}/api/profile/${receiverId}/sharedQuestion`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch shared questions");
    }

    const data = await response.json();
    return data.return.list;
  } catch (err) {
    console.error("Error fetching shared questions:", err);
    throw err;
  }
};

type PatchOperation = {
  op: "add" | "remove" | "replace" | "move" | "copy" | "test";
  path: string;
  value?: any;
};

export const updateQuestionPatch = async (id: string, patches: PatchOperation[]) => {
  try {
    const response = await fetch(`${apiDomain}/api/question/${id}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json-patch+json",
        "x-profile-id": profileId,
      },
      body: JSON.stringify(patches),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update question. Status: ${response.status}. Response: ${errorText}`);
    }

    // Ensure JSON parsing handles potential errors
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating question:", error);
    throw new Error(`An error occurred while updating the question: ${error.message}`);
  }
};

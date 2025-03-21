import { jwtFetch } from "./jwtFetch";

const apiDomain = import.meta.env.VITE_API_DOMAIN;
// Fetch list of questions for a specific user
export const getQuestionsByUser = async () => {
  const profileId = localStorage.getItem("profileId");
  try {
    const response = await jwtFetch(`${apiDomain}/api/profile/${profileId}/question`, {
      method: "GET",
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
export const createQuestion = async (title: string, questionText: string, option: string[] | null) => {
  const profileId = localStorage.getItem("profileId");
  try {
    const response = await jwtFetch(`${apiDomain}/api/question`, {
      method: "POST",
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
    const response = await jwtFetch(`${apiDomain}/api/question/${id}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch question details");
    }

    const data = await response.json();
    return data.return.detail;
  } catch (error) {
    console.error("Error fetching question details:", error);
    throw error;
  }
};

// Update an existing question
export const updateQuestion = async (id: string, data: { title: string; questionText: string; option: string[] | null }) => {
  try {
    const response = await jwtFetch(`${apiDomain}/api/question/${id}`, {
      method: "PUT",
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
export const shareQuestion = async (id: string, profileId: string, receiverIds: string[]) => {
  try {
    // const response = await jwtFetch(`${apiDomain}/api/question/${id}/share`, {
    //   method: "POST",
    //   body: JSON.stringify({
    //     profile_id: profileId,
    //     receiver_ids: receiverIds,
    //   }),
    // });
    const response = await jwtFetch(`${apiDomain}/api/shareQuestionCmd`, {
      method: "POST",
      body: JSON.stringify({
        new_question_id: id,
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

// Submit an answer
export const submitAnswer = async (
  id: string,
  answerPayload: { option: string | null; answerText: string | null; answerDuration: number },
  questionText: string | null
) => {
  const profileId = localStorage.getItem("profileId");
  try {
    const response = await jwtFetch(`${apiDomain}/api/question/${id}/answer`, {
      method: "POST",
      body: JSON.stringify({
        profile_id: profileId,
        question: questionText,
        option: answerPayload.option,
        answer: answerPayload.answerText,
        duration: answerPayload.answerDuration,
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

export const getAnswerListByQuestionId = async (id: string) => {
  try {
    const response = await jwtFetch(`${apiDomain}/api/question/${id}/answer`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch answers");
    }

    const data = await response.json();
    return data.return.list;
  } catch (err) {
    console.error("Error fetching answers:", err);
    throw err;
  }
};

export const getSharedQuestionList = async () => {
  const profileId = localStorage.getItem("profileId");
  try {
    const response = await jwtFetch(`${apiDomain}/api/profile/${profileId}/sharedQuestion`, {
      method: "GET",
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
  const profileId = localStorage.getItem("profileId");
  try {
    const response = await jwtFetch(`${apiDomain}/api/question/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json-patch+json",
        ...(profileId && { "x-profile-id": profileId }),
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
    if (error instanceof Error) {
      throw new Error(`An error occurred while updating the question: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred while updating the question");
    }
  }
};

export const sendFollowUpQuestion = async (
  questionId: string,
  questionFilter: { option: string[]; question_id: string }[],
  followUpQuestionId: string,
  saveFilter: boolean
) => {
  const profileId = localStorage.getItem("profileId");
  try {
    const response = await jwtFetch(`${apiDomain}/api/sendFollowUpCmd`, {
      method: "POST",
      body: JSON.stringify({
        profile_id: profileId,
        new_question_id: followUpQuestionId,
        question: questionFilter,
        save: saveFilter,
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

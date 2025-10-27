/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { jwtFetch } from "@zenmechat/shared-ui/api/jwtFetch";
import { getConfig } from "@zenmechat/shared-ui/config/loadConfig";
const apiDomain = getConfig("QUEST5TIER_DOMAIN");
// Fetch list of questions for a specific user
export const getQuestionsByUser = async () => {
  const profileId = localStorage.getItem("profileId");
  try {
    const response = await jwtFetch(`${apiDomain}/questionQry/getQuestions/${profileId}`, {
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
    const response = await jwtFetch(`${apiDomain}/questionCmd/createQuestion`, {
      method: "POST",
      body: JSON.stringify({
        profileId: profileId,
        title: title,
        questionText: questionText,
        option: option,
      }), // Send the request body as JSON
    });

    if (!response.ok) {
      throw new Error("Failed to create question");
    }

    const result = await response.json();
    return result.return;
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
};

// Get question detail
export const getQuestionById = async (id: string) => {
  try {
    const response = await jwtFetch(`${apiDomain}/questionQry/getQuestion/${id}`, {
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
    const response = await jwtFetch(`${apiDomain}/questionCmd/updateQuestion/${id}`, {
      method: "POST",
      body: JSON.stringify({
        title: data.title,
        questionText: data.questionText,
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
    // const response = await jwtFetch(`${apiDomain}/question/${id}/share`, {
    //   method: "POST",
    //   body: JSON.stringify({
    //     profile_id: profileId,
    //     receiver_ids: receiverIds,
    //   }),
    // });
    const response = await jwtFetch(`${apiDomain}/questionCmd/shareQuestion`, {
      method: "POST",
      body: JSON.stringify({
        newQuestionId: id,
        profileId: profileId,
        receiverIds: receiverIds,
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
  answerPayload: { option: string[] | null; answerText: string | null; answerDuration: number; when: string | null },
  questionText: string | null
) => {
  const profileId = localStorage.getItem("profileId");
  try {
    const response = await jwtFetch(`${apiDomain}/questionCmd/createAnswer/${id}`, {
      method: "POST",
      body: JSON.stringify({
        profileId: profileId,
        questionText: questionText,
        option: answerPayload.option,
        answer: answerPayload.answerText,
        duration: answerPayload.answerDuration,
        when: answerPayload.when,
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
    const response = await jwtFetch(`${apiDomain}/questionQry/getAnswers/${id}`, {
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
    const response = await jwtFetch(`${apiDomain}/questionQry/getSharedQuestions/${profileId}`, {
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
    const response = await jwtFetch(`${apiDomain}/questionCmd/updateQuestion/${id}`, {
      method: "POST",
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
  questionFilter: { option: string[]; questionId: string }[],
  followUpQuestionIds: string[],
  saveFilter: boolean
) => {
  const profileId = localStorage.getItem("profileId");
  try {
    const response = await jwtFetch(`${apiDomain}/questionCmd/sendFollowUp`, {
      method: "POST",
      body: JSON.stringify({
        profileId: profileId,
        questionIdList: followUpQuestionIds,
        question: questionFilter,
        isSave: saveFilter,
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

const apiDomain = import.meta.env.VITE_API_DOMAIN;
const profileId = "1007"; // Replace with actual user ID

// Fetch list of questions for a specific user
export const getQuestionsByUser = async () => {
  try {
    const response = await fetch(`${apiDomain}/api/profile/${profileId}/question`, {
      method: 'GET',  // HTTP method
      headers: {
        'Accept': 'application/json',  // We expect JSON in response
        'Content-Type': 'application/json',  // We're sending JSON
        'Access-Control-Allow-Origin': '*'  // Allow cross-origin requests (CORS)
      }
    });

    // Check if the response is okay (status code 2xx)
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }

    // Parse the JSON response body
    const data = await response.json();
    return data.return.list;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;  // Re-throw the error to be handled in the component
  }
};

// Create a new questionnaire
export const createQuestion = async (title: string, questionText: string) => {
  try {
    const response = await fetch(`${apiDomain}/api/question`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
            profile_id: profileId,
            title: title,
            question: questionText,
      }) // Send the request body as JSON
    });

    if (!response.ok) {
      throw new Error('Failed to create question');
    }

    const result = await response.json();
    return result.return.id;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

// Get question detail
export const getQuestionById = async (id: string) => {
    try {
    const response = await fetch(`${apiDomain}/api/question/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch question details');
    }

      const data = await response.json();
      return data.return.detail;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  };

// Update an existing question
export const updateQuestion = async (id: string, data: { title: string; description: string }) => {
  try {
    const response = await fetch(`${apiDomain}/api/question/${id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update question');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

// Share a question
export const shareQuestion = async (id: string, email: string) => {
  try {
    const response = await fetch(`${apiDomain}/api/question/${id}/share`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      throw new Error('Failed to share question');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sharing question:', error);
    throw error;
  }
};

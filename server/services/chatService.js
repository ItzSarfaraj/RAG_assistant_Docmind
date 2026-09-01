import axios from "axios";

const API_URL = "http://localhost:5000/api";

const askQuestion = async (question, documentId, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/chat`,
      {
        question,
        documentId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      "Failed to get answer."
    );
  }
};

export { askQuestion };
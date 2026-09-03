import axios from "axios";

const API_URL = "http://localhost:5000/api";

const generateFlashcards = async ({ documentIds, title, count }, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/flashcards/generate`,
      {
        documentIds,
        title,
        count,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Generate flashcards API error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
        "Failed to generate flashcards."
    );
  }
};

const getFlashcardSets = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/flashcards`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Get flashcard sets API error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
        "Failed to load flashcard sets."
    );
  }
};

const getFlashcardSet = async (flashcardId, token) => {
  try {
    const response = await axios.get(
      `${API_URL}/flashcards/${flashcardId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get flashcard set API error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
        "Failed to load flashcard set."
    );
  }
};

const getDueCards = async (flashcardId, token) => {
  try {
    const response = await axios.get(
      `${API_URL}/flashcards/${flashcardId}/due`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get due cards API error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
        "Failed to load due cards."
    );
  }
};

const reviewCard = async (flashcardId, cardId, correct, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/flashcards/${flashcardId}/cards/${cardId}/review`,
      { correct },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Review flashcard API error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
        "Failed to submit card review."
    );
  }
};

export {
  generateFlashcards,
  getFlashcardSets,
  getFlashcardSet,
  getDueCards,
  reviewCard,
};
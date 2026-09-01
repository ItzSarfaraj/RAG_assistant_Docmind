import axios from "axios";

const API_URL = "http://localhost:5000/api";

// ==========================================
// GET CHAT HISTORY
// ==========================================

const getChatHistory = async (documentId, token) => {
  try {
    const response = await axios.get(`${API_URL}/chat-history/${documentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Get chat history error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message || "Failed to load chat history.",
    );
  }
};

// ==========================================
// SAVE MESSAGE
// ==========================================

const saveChatMessage = async ({
  documentId,
  role,
  content,
  sources = [],
  token,
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/chat-history/message`,
      {
        documentId,
        role,
        content,
        sources,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "Save chat message error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message || "Failed to save chat message.",
    );
  }
};

export { getChatHistory, saveChatMessage };

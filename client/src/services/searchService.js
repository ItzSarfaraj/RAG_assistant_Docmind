import axios from "axios";

const API_URL = "http://localhost:5000/api";

const searchDocuments = async (query, documentId, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/search`,
      {
        query,
        documentId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Search API error:", error.response?.data || error.message);

    throw new Error(
      error.response?.data?.message ||
        "Failed to search your document.",
    );
  }
};

export { searchDocuments };
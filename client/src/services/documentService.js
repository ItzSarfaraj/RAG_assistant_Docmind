import axios from "axios";

const API_URL = "http://localhost:5000/api";

const uploadDocument = async (file, token) => {
  const formData = new FormData();

  formData.append("document", file);

  try {
    const response = await axios.post(`${API_URL}/documents/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Upload API error:", error.response?.data || error.message);

    throw new Error(error.response?.data?.message || "Document upload failed.");
  }
};

const getDocuments = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/documents`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;

  } catch (error) {
    console.error(
      "Get documents API error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
      "Failed to fetch documents."
    );
  }
};


const deleteDocument = async (documentId, token) => {
  try {
    const response = await axios.delete(
      `${API_URL}/documents/${documentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Delete document API error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
        "Failed to delete document."
    );
  }
};
export { uploadDocument,getDocuments,deleteDocument };

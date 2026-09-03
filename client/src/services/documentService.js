import axios from "axios";

const API_URL = "http://localhost:5000/api";

// `saveToLibrary` defaults to true so existing callers (the main
// Documents-page uploader) keep working unchanged. Pass
// `{ saveToLibrary: false }` for uploads that should only be indexed
// for the current session (e.g. the Search page) and not appear on
// the Documents page until the user explicitly saves them.
const uploadDocument = async (file, token, { saveToLibrary = true } = {}) => {
  const formData = new FormData();

  formData.append("document", file);
  formData.append("saveToLibrary", saveToLibrary ? "true" : "false");

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

const addWebDocument = async (url, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/web`,
      { url },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "Web document API error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        "Failed to process webpage.",
    );
  }
};

const updateDocument = async (documentId, updates, token) => {
  try {
    const response = await axios.patch(
      `${API_URL}/documents/${documentId}`,
      updates,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update document.");
  }
};
export { uploadDocument, addWebDocument, getDocuments, deleteDocument, updateDocument };
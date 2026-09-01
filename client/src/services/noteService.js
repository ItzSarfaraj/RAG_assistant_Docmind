import axios from "axios";

const API_URL = "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| Generate Notes
|--------------------------------------------------------------------------
*/

export const generateNotes = async (documentId, configuration, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/notes/generate`,

      {
        documentId,
        ...configuration,
      },

      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to generate notes.",
    );
  }
};

/*
|--------------------------------------------------------------------------
| Get All Notes
|--------------------------------------------------------------------------
*/

export const getNotes = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/notes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to load notes.",
    );
  }
};

/*
|--------------------------------------------------------------------------
| Delete Note
|--------------------------------------------------------------------------
*/

export const deleteNote = async (noteId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/notes/${noteId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete note.",
    );
  }
};

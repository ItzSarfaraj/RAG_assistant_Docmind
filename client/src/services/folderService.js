import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const getFolders = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/folders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to load folders.");
  }
};

export const createFolder = async (name, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/folders`,
      { name },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create folder.");
  }
};

export const renameFolder = async (folderId, name, token) => {
  try {
    const response = await axios.patch(
      `${API_URL}/folders/${folderId}`,
      { name },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to rename folder.");
  }
};

export const deleteFolder = async (folderId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/folders/${folderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete folder.");
  }
};
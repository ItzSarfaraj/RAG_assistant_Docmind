import axios from "axios";

const RAG_URL = process.env.RAG_URL || "http://localhost:8000";

export const generateNotes = async ({
  documentId,
  detailLevel,
  explanationLevel,
  include,
  faithfulToVideo,
}) => {
  try {
    const response = await axios.post(`${RAG_URL}/notes/generate`, {
      document_id: documentId,

      detail_level: detailLevel || "detailed",

      explanation_level: explanationLevel || "intermediate",

      include: include || {},

      faithful_to_video: faithfulToVideo !== undefined ? faithfulToVideo : true,

      k: 10,
    });

    return response.data;
  } catch (error) {
    console.error(
      "RAG note generation error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.detail ||
        "Failed to generate notes from the video.",
    );
  }
};

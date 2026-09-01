import axios from "axios";

const RAG_SERVICE_URL =
  process.env.RAG_SERVICE_URL || "http://127.0.0.1:8000";

const ragClient = axios.create({
  baseURL: RAG_SERVICE_URL,
  timeout: 120000,
});

const indexDocument = async ({
  source,
  documentId,
  sourceType = "file",
}) => {
  try {
    const response = await ragClient.post("/documents/index", {
      source,
      document_id: documentId,
      source_type: sourceType,
    });

    console.log("RAG response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "RAG indexing error:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

const askQuestion = async ({
  question,
  documentId,
  k = 4,
}) => {
  const response = await ragClient.post("/chat/answer", {
    question,
    document_id: documentId,
    k,
  });

  return response.data;
};

const streamQuestion = async ({
  question,
  documentId,
  k = 4,
  onChunk,
}) => {
  const response = await ragClient.post(
    "/chat",
    {
      question,
      document_id: documentId,
      k,
    },
    {
      responseType: "stream",
      timeout: 120000,
    },
  );

  const stream = response.data;

  let buffer = "";

  stream.on("data", (chunk) => {
    buffer += chunk.toString();

    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const event of events) {
      if (!event.startsWith("data:")) {
        continue;
      }

      const data = event.replace(/^data:\s*/, "");

      try {
        const parsed = JSON.parse(data);
        onChunk(parsed);
      } catch (error) {
        console.error("Failed to parse RAG stream:", error);
      }
    }
  });

  return new Promise((resolve, reject) => {
    stream.on("end", resolve);
    stream.on("error", reject);
  });
};

const generateNotes = async ({
  documentId,
  detailLevel = "detailed",
  explanationLevel = "intermediate",
  noteStructure = "structured",
  include = {},
  faithfulToVideo = true,
}) => {
  try {
    const response = await ragClient.post(
      "/notes/generate",
      {
        document_id: documentId,
        detail_level: detailLevel,
        explanation_level: explanationLevel,
        note_structure: noteStructure,
        include,
        faithful_to_video: faithfulToVideo,
      },
      {
        timeout: 600000,
      },
    );

    console.log("RAG notes response received");

    return response.data;
  } catch (error) {
    console.error(
      "RAG note generation error:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export {
  indexDocument,
  askQuestion,
  streamQuestion,
  generateNotes,
};
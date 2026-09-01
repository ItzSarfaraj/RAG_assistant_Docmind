import axios from "axios";

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://127.0.0.1:8000";

const ragClient = axios.create({
  baseURL: RAG_SERVICE_URL,
  timeout: 120000,
});

// ==========================================
// Document Indexing
// ==========================================

const indexDocument = async ({ filePath, documentId }) => {
  const response = await ragClient.post("/documents/index", {
    file_path: filePath,
    document_id: documentId,
  });

  return response.data;
};

// ==========================================
// Normal Question Answering
// ==========================================

const askQuestion = async ({ question, documentId, k = 4 }) => {
  const response = await ragClient.post("/chat", {
    question,
    document_id: documentId,
    k,
  });

  return response.data;
};

// ==========================================
// Streaming Question Answering
// ==========================================

const streamQuestion = async ({ question, documentId, k = 4, onChunk }) => {
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
    stream.on("end", () => {
      resolve();
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
};

export { indexDocument, askQuestion, streamQuestion };

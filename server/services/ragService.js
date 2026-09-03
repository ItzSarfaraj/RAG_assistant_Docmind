// services/ragService.js
import axios from "axios";

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://127.0.0.1:8000";

const ragClient = axios.create({
  baseURL: RAG_SERVICE_URL,
  timeout: 120000, // default for quick calls (index, chat/answer)
});

const indexDocument = async ({ source, documentId, sourceType = "file" }) => {
  const response = await ragClient.post("/documents/index", {
    source,
    document_id: documentId,
    source_type: sourceType,
  });
  return response.data;
};

export const generateFlashcards = async ({ documentIds, count }) => {
  const response = await axios.post(`${RAG_SERVICE_URL}/flashcards/generate`, {
    document_ids: documentIds,
    count,
  });
  return response.data; // { cards: [...] }
};

const askQuestion = async ({ question, documentId, k = 4 }) => {
  const response = await ragClient.post("/chat/answer", {
    question,
    document_id: documentId,
    k,
  });
  return response.data;
};

const streamQuestion = async ({ question, documentId, k = 4, onChunk }) => {
  const response = await ragClient.post(
    "/chat",
    { question, document_id: documentId, k },
    { responseType: "stream", timeout: 120000 },
  );

  let buffer = "";
  response.data.on("data", (chunk) => {
    buffer += chunk.toString();
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";
    for (const event of events) {
      if (!event.startsWith("data:")) continue;
      try {
        onChunk(JSON.parse(event.replace(/^data:\s*/, "")));
      } catch (error) {
        console.error("Failed to parse RAG stream:", error);
      }
    }
  });

  return new Promise((resolve, reject) => {
    response.data.on("end", resolve);
    response.data.on("error", reject);
  });
};

// Blocking notes call — kept for any caller that just wants the final result
// (e.g. background workers). Prefer streamNotes for anything user-facing.
const generateNotes = async ({
  documentId,
  detailLevel = "detailed",
  explanationLevel = "intermediate",
  noteStructure = "structured",
  include = {},
  faithfulToVideo = true,
}) => {
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
    { timeout: 600000 },
  );
  return response.data;
};

// Streams progress events from the RAG service's /notes/generate/stream
// endpoint. onEvent receives {type: "progress"|"notes"|"error"|"done", ...}
const streamNotes = async ({
  documentId,
  detailLevel = "detailed",
  explanationLevel = "intermediate",
  noteStructure = "structured",
  include = {},
  faithfulToVideo = true,
  onEvent,
}) => {
  const response = await ragClient.post(
    "/notes/generate/stream",
    {
      document_id: documentId,
      detail_level: detailLevel,
      explanation_level: explanationLevel,
      note_structure: noteStructure,
      include,
      faithful_to_video: faithfulToVideo,
    },
    { responseType: "stream", timeout: 600000 },
  );

  let buffer = "";
  let finalPayload = null;

  response.data.on("data", (chunk) => {
    buffer += chunk.toString();
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";
    for (const event of events) {
      if (!event.startsWith("data:")) continue;
      try {
        const parsed = JSON.parse(event.replace(/^data:\s*/, ""));
        if (parsed.type === "notes") finalPayload = parsed;
        onEvent?.(parsed);
      } catch (error) {
        console.error("Failed to parse RAG notes stream:", error);
      }
    }
  });

  await new Promise((resolve, reject) => {
    response.data.on("end", resolve);
    response.data.on("error", reject);
  });

  if (!finalPayload) {
    throw new Error("RAG service closed the stream without returning notes.");
  }

  return finalPayload;
};

const searchDocuments = async ({ query, documentIds, k = 10 }) => {
  const response = await ragClient.post("/search", {
    query,
    document_ids: documentIds,
    k,
  });

  return response.data;
};

export { indexDocument, askQuestion, streamQuestion, generateNotes, streamNotes,searchDocuments };
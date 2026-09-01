import { streamQuestion } from "../services/ragService.js";

const chatWithDocument = async (req, res) => {
  try {
    const { question, documentId } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    if (!documentId) {
      return res.status(400).json({
        message: "Document ID is required",
      });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    await streamQuestion({
      question,
      documentId,
      k: 4,
      onChunk: (chunk) => {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      },
    });

    res.end();
  } catch (error) {
    console.error("Chat streaming error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to process question",
      });
    }

    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: error.message,
      })}\n\n`,
    );

    res.end();
  }
};

export { chatWithDocument };
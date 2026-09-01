import { streamQuestion } from "../services/ragService.js";

// @desc    Ask a question about a document
// @route   POST /api/chat
// @access  Private

const chatWithDocument = async (req, res) => {
  try {
    const { question, documentId } = req.body;

    // Validate question
    if (!question?.trim()) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    // Validate document
    if (!documentId) {
      return res.status(400).json({
        message: "Document ID is required",
      });
    }

    // ==========================================
    // Setup Server-Sent Events
    // ==========================================

    res.setHeader("Content-Type", "text/event-stream");

    res.setHeader("Cache-Control", "no-cache");

    res.setHeader("Connection", "keep-alive");

    // Flush headers immediately
    res.flushHeaders();

    // ==========================================
    // Stream response from RAG service
    // ==========================================

    await streamQuestion({
      question,
      documentId,
      k: 4,

      onChunk: (chunk) => {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      },
    });

    // ==========================================
    // Streaming completed
    // ==========================================

    res.end();
  } catch (error) {
    console.error("Chat streaming error:", error.message);

    // If headers haven't been sent,
    // return normal JSON error
    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to process question",
        error: error.message,
      });
    }

    // If streaming already started,
    // send error through the stream
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

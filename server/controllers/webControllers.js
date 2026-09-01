import Document from "../models/Document.js";
import { indexDocument } from "../services/ragService.js";

const addWebDocument = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({
        message: "Web URL is required",
      });
    }

    const sourceUrl = url.trim();

    let parsedUrl;

    try {
      parsedUrl = new URL(sourceUrl);
    } catch {
      return res.status(400).json({
        message: "Invalid URL",
      });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        message: "Only http/https URLs are supported",
      });
    }

    const document = await Document.create({
      user: req.user.id,
      name: sourceUrl,
      originalName: sourceUrl,
      sourceType: "web",
      contentType: "webpage",
      sourceUrl,
      status: "pending",
    });

    try {
      console.log("Web URL sent to RAG:", sourceUrl);

      const ragResult = await indexDocument({
        source: sourceUrl,
        documentId: document._id.toString(),
        sourceType: "web",
      });

      document.status = "indexed";
      document.chunkCount = ragResult.chunks_created;

      await document.save();

      return res.status(201).json({
        message: "Webpage added and indexed successfully",

        document: {
          _id: document._id,
          name: document.name,
          originalName: document.originalName,
          sourceType: document.sourceType,
          contentType: document.contentType,
          sourceUrl: document.sourceUrl,
          status: document.status,
          chunkCount: document.chunkCount,
          createdAt: document.createdAt,
          url: document.sourceUrl,
        },

        rag: {
          chunksCreated: ragResult.chunks_created,
          status: ragResult.status,
        },
      });
    } catch (ragError) {
      console.error("Web indexing failed:", ragError.message);

      document.status = "failed";
      document.errorMessage = ragError.message;

      await document.save();

      return res.status(500).json({
        message: "Webpage added but indexing failed",

        document: {
          _id: document._id,
          name: document.name,
          sourceType: document.sourceType,
          contentType: document.contentType,
          sourceUrl: document.sourceUrl,
          status: document.status,
          errorMessage: document.errorMessage,
        },

        error: ragError.message,
      });
    }
  } catch (error) {
    console.error("Add web document error:", error.message);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export { addWebDocument };

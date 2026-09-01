import Document from "../models/Document.js";
import { indexDocument } from "../services/ragService.js";

const addVideo = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({
        message: "Video URL is required",
      });
    }

    const videoUrl = url.trim();

    // Create document record
    const document = await Document.create({
      user: req.user.id,
      name: "YouTube Video",
      originalName: null,
      sourceType: "video",
      contentType: "youtube",
      sourceUrl: videoUrl,
      filePath: null,
      fileSize: null,
      status: "pending",
    });

    // Send video to RAG service
    try {
      console.log("Video URL sent to RAG:", videoUrl);

      const ragResult = await indexDocument({
        source: videoUrl,
        documentId: document._id.toString(),
        sourceType: "video",
      });

      // RAG indexing successful
      document.status = "indexed";
      document.chunkCount = ragResult.chunks_created;

      await document.save();

      return res.status(201).json({
        message: "Video added and indexed successfully",
        document: {
          _id: document._id,
          name: document.name,
          sourceType: document.sourceType,
          contentType: document.contentType,
          sourceUrl: document.sourceUrl,
          status: document.status,
          chunkCount: document.chunkCount,
          createdAt: document.createdAt,
        },
        rag: {
          chunksCreated: ragResult.chunks_created,
          status: ragResult.status,
        },
      });
    } catch (ragError) {
      console.error("Video indexing failed:", ragError.message);

      document.status = "failed";
      document.errorMessage = ragError.message;

      await document.save();

      return res.status(500).json({
        message: "Video added but indexing failed",
        document: {
          _id: document._id,
          name: document.name,
          sourceType: document.sourceType,
          contentType: document.contentType,
          sourceUrl: document.sourceUrl,
          status: document.status,
          errorMessage: document.errorMessage,
        },
      });
    }
  } catch (error) {
    console.error("Add video error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export { addVideo };

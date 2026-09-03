import Document from "../models/Document.js";
import { searchDocuments } from "../services/ragService.js";

const searchController = async (req, res) => {
  try {
    const { query, documentId } = req.body;

    if (!query?.trim()) {
      return res.status(400).json({
        message: "Search query is required.",
      });
    }

    if (!documentId) {
      return res.status(400).json({
        message: "Document ID is required.",
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      user: req.user.id,
      status: "indexed",
    }).select("_id name originalName sourceType contentType");

    if (!document) {
      return res.status(404).json({
        message: "Document not found or not indexed.",
      });
    }

    const { results } = await searchDocuments({
      query: query.trim(),
      documentIds: [document._id.toString()],
      k: 10,
    });

    const enrichedResults = results.map((result) => ({
      ...result,
      document: {
        id: document._id,
        name: document.name,
        originalName: document.originalName,
        sourceType: document.sourceType,
        contentType: document.contentType,
      },
    }));

    res.status(200).json({
      query: query.trim(),
      results: enrichedResults,
      documentCount: 1,
    });
  } catch (error) {
    console.error("Search error:", error.message);

    res.status(500).json({
      message: "Failed to search your document.",
    });
  }
};

export default searchController;
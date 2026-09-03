import Document from "../models/Document.js";
import { indexDocument } from "../services/ragService.js";
import path from "path";

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No document uploaded",
      });
    }

    const fileExtension = req.file.originalname.split(".").pop().toLowerCase();

    const allowedTypes = ["pdf", "txt", "docx"];

    if (!allowedTypes.includes(fileExtension)) {
      return res.status(400).json({
        message: "Unsupported file type",
      });
    }

    // Multer puts non-file form fields on req.body alongside the file.
    // Default to true so existing callers that don't send this field
    // (e.g. the main Documents-page uploader) keep today's behavior.
    // The Search-page uploader explicitly sends "false" to index a
    // document for the session without adding it to the library.
    const saveToLibrary = req.body.saveToLibrary !== "false";

    const document = await Document.create({
      user: req.user.id,

      name: req.file.originalname,

      originalName: req.file.originalname,

      sourceType: "file",

      contentType: fileExtension,

      filePath: req.file.path,

      fileSize: req.file.size,

      status: "pending",

      savedToLibrary: saveToLibrary,
    });

    // ==========================================
    // Send document to RAG service
    // ==========================================

    try {
      const fileName = path.basename(req.file.path);

      console.log("File sent to RAG:", fileName);

      const ragResult = await indexDocument({
        source: fileName,
        documentId: document._id.toString(),
        sourceType: "file",
      });

      // ==========================================
      // RAG indexing successful
      // ==========================================

      document.status = "indexed";
      document.chunkCount = ragResult.chunks_created;

      await document.save();

      return res.status(201).json({
        message: "Document uploaded and indexed successfully",

        document: {
          _id: document._id,
          name: document.name,
          originalName: document.originalName,

          sourceType: document.sourceType,
          contentType: document.contentType,

          fileSize: document.fileSize,

          status: document.status,
          chunkCount: document.chunkCount,

          savedToLibrary: document.savedToLibrary,

          createdAt: document.createdAt,

          // Browser-accessible URL
          url: `/uploads/${path.basename(document.filePath)}`,
        },

        rag: {
          chunksCreated: ragResult.chunks_created,
          status: ragResult.status,
        },
      });
    } catch (ragError) {
      console.error("RAG indexing failed:", ragError.message);

      document.status = "failed";
      document.errorMessage = ragError.message;

      await document.save();

      return res.status(500).json({
        message: "Document uploaded but indexing failed",

        document: {
          _id: document._id,
          name: document.name,
          status: document.status,
          errorMessage: document.errorMessage,
          savedToLibrary: document.savedToLibrary,

          url: `/uploads/${path.basename(document.filePath)}`,
        },

        error: ragError.message,
      });
    }
  } catch (error) {
    console.error("Document upload error:", error.message);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET DOCUMENTS
// ==========================================
// Only returns documents the user has actually saved to their library.
// Session-only documents (savedToLibrary: false, e.g. from the Search
// page) stay indexed/searchable but don't clutter this list. Legacy
// documents with no savedToLibrary field (created before this change)
// are treated as saved, via the $ne: false filter.

const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      user: req.user.id,
      savedToLibrary: { $ne: false },
    })
      .populate("folder", "name color")
      .sort({ createdAt: -1 });

    const documentsWithUrls = documents.map((document) => {
      const documentObject = document.toObject();

      return {
        ...documentObject,
        url: document.filePath ? `/uploads/${path.basename(document.filePath)}` : null,
      };
    });

    res.status(200).json({ documents: documentsWithUrls });
  } catch (error) {
    console.error("Get documents error:", error.message);
    res.status(500).json({ message: "Failed to fetch documents", error: error.message });
  }
};

// ==========================================
// DELETE DOCUMENT
// ==========================================

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    await Document.deleteOne({
      _id: document._id,
    });

    res.status(200).json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error.message);

    res.status(500).json({
      message: "Failed to delete document",
      error: error.message,
    });
  }
};

const updateDocument = async (req, res) => {
  try {
    const { folder, progress, name, savedToLibrary } = req.body;

    const document = await Document.findOne({ _id: req.params.id, user: req.user.id });

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Document name cannot be empty." });
      }
      document.name = name.trim();
    }

    if (folder !== undefined) {
      document.folder = folder || null;
    }

    if (progress !== undefined) {
      document.progress = Math.max(0, Math.min(100, Number(progress) || 0));
    }

    // Lets the frontend explicitly "save" a session-only document
    // (e.g. the Search page's "Save to my documents" button) by
    // flipping savedToLibrary to true.
    if (savedToLibrary !== undefined) {
      document.savedToLibrary = Boolean(savedToLibrary);
    }

    await document.save();
    await document.populate("folder", "name color");

    return res.status(200).json({
      document: {
        ...document.toObject(),
        url: document.filePath ? `/uploads/${path.basename(document.filePath)}` : null,
      },
    });
  } catch (error) {
    console.error("Update document error:", error.message);
    return res.status(500).json({ message: "Failed to update document." });
  }
};

export { uploadDocument, getDocuments, deleteDocument, updateDocument };
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    // Owner of the knowledge source
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Display name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Original uploaded filename
    originalName: {
      type: String,
      default: null,
    },

    // Source category
    sourceType: {
      type: String,
      enum: ["file", "web", "video"],
      required: true,
    },

    // Actual format/provider
    contentType: {
      type: String,
      enum: ["pdf", "txt", "docx", "webpage", "youtube", "video"],
      required: true,
    },

    // URL for web/video sources
    sourceUrl: {
      type: String,
      default: null,
      trim: true,
    },

    // Local/cloud file location
    filePath: {
      type: String,
      default: null,
    },

    // File size in bytes
    fileSize: {
      type: Number,
      default: null,
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Processing state
    status: {
      type: String,
      enum: ["pending", "processing", "indexed", "failed"],
      default: "pending",
    },

    // Number of chunks created during indexing
    chunkCount: {
      type: Number,
      default: 0,
    },

    // Error message if processing fails
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Document = mongoose.model("Document", documentSchema);

export default Document;
